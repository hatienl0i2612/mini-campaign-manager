import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app';
import { db } from '../src/db/connection';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;
let authToken: string;
let userId: string;

beforeAll(async () => {
    app = await buildApp();

    // Clean existing data (test DB is fresh from global-setup, but just in case)
    await db('job_queue').del();
    await db('campaign_recipients').del();
    await db('campaigns').del();
    await db('recipients').del();
    await db('users').del();
});

afterAll(async () => {
    await db.destroy();
    await app.close();
});

describe('Auth API', () => {
    it('should register a new user', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/auth/register',
            payload: {
                email: 'test@example.com',
                name: 'Test User',
                password: 'password123',
            },
        });

        expect(res.statusCode).toBe(201);
        const body = JSON.parse(res.body);
        expect(body.user.email).toBe('test@example.com');
        expect(body.token).toBeDefined();
        authToken = body.token;
        userId = body.user.id;
    });

    it('should login an existing user', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                email: 'test@example.com',
                password: 'password123',
            },
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                email: 'test@example.com',
                password: 'wrongpassword',
            },
        });

        expect(res.statusCode).toBe(401);
    });
});

describe('Campaign API', () => {
    let campaignId: string;
    let recipientIds: string[] = [];

    // Create some recipients first
    beforeAll(async () => {
        const emails = ['r1@test.com', 'r2@test.com', 'r3@test.com'];
        for (const email of emails) {
            const res = await app.inject({
                method: 'POST',
                url: '/api/recipients',
                headers: { authorization: `Bearer ${authToken}` },
                payload: { email, name: email.split('@')[0] },
            });
            const body = JSON.parse(res.body);
            recipientIds.push(body.id);
        }
    });

    it('should create a campaign with draft status', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/campaigns',
            headers: { authorization: `Bearer ${authToken}` },
            payload: {
                name: 'Test Campaign',
                subject: 'Test Subject',
                body: 'Test body content',
                recipientIds,
            },
        });

        expect(res.statusCode).toBe(201);
        const body = JSON.parse(res.body);
        expect(body.status).toBe('draft');
        expect(body.name).toBe('Test Campaign');
        campaignId = body.id;
    });

    it('should send a campaign and enqueue jobs', async () => {
        const res = await app.inject({
            method: 'POST',
            url: `/api/campaigns/${campaignId}/send`,
            headers: { authorization: `Bearer ${authToken}` },
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        // Campaign transitions to 'sending' (async processing via job queue)
        expect(body.status).toBe('sending');

        // Verify jobs were enqueued for each recipient
        const jobs = await db('job_queue')
            .where({ type: 'send_campaign_email' })
            .whereRaw("payload->>'campaign_id' = ?", [campaignId]);
        expect(jobs.length).toBe(3); // 3 recipients

        // Recipients are still 'pending' until worker processes them
        const stats = await db('campaign_recipients')
            .where({ campaign_id: campaignId, status: 'pending' })
            .count('* as count');
        expect(Number(stats[0].count)).toBe(3);
    });

    it('should not allow editing a sent campaign', async () => {
        const res = await app.inject({
            method: 'PUT',
            url: `/api/campaigns/${campaignId}`,
            headers: { authorization: `Bearer ${authToken}` },
            payload: { name: 'Updated Name' },
        });

        expect(res.statusCode).toBe(400);
        const body = JSON.parse(res.body);
        expect(body.error).toContain('draft');
    });

    it('should not allow deleting a sent campaign', async () => {
        const res = await app.inject({
            method: 'DELETE',
            url: `/api/campaigns/${campaignId}`,
            headers: { authorization: `Bearer ${authToken}` },
        });

        expect(res.statusCode).toBe(400);
    });

    it('should not schedule a campaign without recipients', async () => {
        // Create campaign with no recipients
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/campaigns',
            headers: { authorization: `Bearer ${authToken}` },
            payload: {
                name: 'No Recipients Campaign',
                subject: 'Test',
                body: 'Test',
            },
        });
        const emptyId = JSON.parse(createRes.body).id;

        const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const res = await app.inject({
            method: 'POST',
            url: `/api/campaigns/${emptyId}/schedule`,
            headers: { authorization: `Bearer ${authToken}` },
            payload: { scheduled_at: future },
        });

        expect(res.statusCode).toBe(400);
        const body = JSON.parse(res.body);
        expect(body.error).toContain('recipient');
    });

    it('should get campaign detail', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/campaigns/${campaignId}`,
            headers: { authorization: `Bearer ${authToken}` },
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.id).toBe(campaignId);
        expect(body.status).toBe('sending');
        expect(body.total_recipients).toBe(3);
    });

    it('should get campaign stats', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/campaigns/${campaignId}/stats`,
            headers: { authorization: `Bearer ${authToken}` },
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.total).toBe(3);
        expect(body.pending).toBe(3);
        expect(body.sent).toBe(0);
        expect(body.failed).toBe(0);
    });

    it('should reflect recipient progress in stats', async () => {
        // Manually simulate a worker finishing 2 jobs
        // Use a subquery because Postgres doesn't support UPDATE ... LIMIT directly
        const subquery = db('campaign_recipients')
            .where({ campaign_id: campaignId })
            .select('recipient_id')
            .limit(2);

        await db('campaign_recipients')
            .where({ campaign_id: campaignId })
            .whereIn('recipient_id', subquery)
            .update({
                status: 'sent',
                sent_at: new Date(),
            });

        const res = await app.inject({
            method: 'GET',
            url: `/api/campaigns/${campaignId}/stats`,
            headers: { authorization: `Bearer ${authToken}` },
        });

        const body = JSON.parse(res.body);
        expect(body.sent).toBe(2);
        expect(body.pending).toBe(1);
    });

    it('should schedule a draft campaign', async () => {
        // Create a new draft
        const createRes = await app.inject({
            method: 'POST',
            url: '/api/campaigns',
            headers: { authorization: `Bearer ${authToken}` },
            payload: {
                name: 'Scheduled Campaign',
                subject: 'Later',
                body: 'Content',
                recipientIds,
            },
        });
        const id = JSON.parse(createRes.body).id;

        const future = new Date(Date.now() + 1000 * 60 * 60).toISOString();
        const res = await app.inject({
            method: 'POST',
            url: `/api/campaigns/${id}/schedule`,
            headers: { authorization: `Bearer ${authToken}` },
            payload: { scheduled_at: future },
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.status).toBe('scheduled');
        expect(body.scheduled_at).toBeDefined();
    });

    it('should filter campaigns by status', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/campaigns?status=scheduled',
            headers: { authorization: `Bearer ${authToken}` },
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.data.length).toBeGreaterThan(0);
        expect(body.data.every((c: any) => c.status === 'scheduled')).toBe(true);
    });
});
