import { db } from '@/db/connection';
import { PAGINATION } from '@mini-campaign-manager/shared';
import { JobQueueService } from './job-queue.service';
import type {
    CampaignWithStats,
    CampaignDetail,
    CampaignStats,
    PaginatedResponse,
} from '@mini-campaign-manager/shared';

/**
 * Campaign Service
 * Handles campaign CRUD, scheduling, sending simulation, and stats.
 */
export class CampaignService {
    /**
     * List all campaigns for a user with pagination and optional status filter
     */
    static async findAll(
        userId: string,
        page: number = PAGINATION.DEFAULT_PAGE,
        limit: number = PAGINATION.DEFAULT_LIMIT,
        status?: string,
    ): Promise<PaginatedResponse<CampaignWithStats>> {
        const offset = (page - 1) * limit;

        const query = db('campaigns').where({ created_by: userId });
        if (status) query.andWhere({ status });

        // Get total count
        const [{ count }] = await query.clone().count<{ count: string }[]>('* as count');
        const total = Number(count);

        // Get paginated rows
        const rows = await query.orderBy('updated_at', 'desc').limit(limit).offset(offset);

        if (rows.length === 0) {
            return {
                data: [],
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            };
        }

        // Batch-fetch recipient stats for ALL campaigns
        const campaignIds = rows.map((c) => c.id);
        const { rows: statsRows } = await db.raw(
            `SELECT
                campaign_id,
                COUNT(*)::int                                      AS total_recipients,
                COUNT(*) FILTER (WHERE status = 'sent')::int       AS sent_count,
                COUNT(*) FILTER (WHERE status = 'failed')::int     AS failed_count,
                COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::int AS opened_count
            FROM campaign_recipients
            WHERE campaign_id = ANY(?)
            GROUP BY campaign_id`,
            [campaignIds],
        );

        const statsMap = new Map<
            string,
            {
                total_recipients: number;
                sent_count: number;
                failed_count: number;
                opened_count: number;
            }
        >();
        for (const row of statsRows) {
            statsMap.set(row.campaign_id, {
                total_recipients: row.total_recipients,
                sent_count: row.sent_count,
                failed_count: row.failed_count,
                opened_count: row.opened_count,
            });
        }

        const defaultStats = {
            total_recipients: 0,
            sent_count: 0,
            failed_count: 0,
            opened_count: 0,
        };
        const campaigns: CampaignWithStats[] = rows.map((c) => ({
            ...c,
            ...(statsMap.get(c.id) || defaultStats),
        })) as CampaignWithStats[];

        return {
            data: campaigns,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get a single campaign by ID (with recipients)
     */
    static async findById(id: string, userId: string): Promise<CampaignDetail | null> {
        const campaign = await db('campaigns').where({ id, created_by: userId }).first();
        if (!campaign) return null;

        const [stats, recipientRows] = await Promise.all([
            CampaignService.getRecipientCounts(id),
            db('campaign_recipients as cr')
                .join('recipients as r', 'cr.recipient_id', 'r.id')
                .where('cr.campaign_id', id)
                .select(
                    'r.id',
                    'r.email',
                    'r.name',
                    'cr.status as delivery_status',
                    'cr.sent_at',
                    'cr.opened_at',
                )
                .orderBy('r.email', 'asc'),
        ]);

        return {
            ...campaign,
            ...stats,
            recipients: recipientRows,
        } as CampaignDetail;
    }

    /**
     * Create a new campaign (status defaults to 'draft')
     */
    static async create(
        data: { name: string; subject: string; body: string; recipientIds?: string[] },
        userId: string,
    ) {
        const [campaign] = await db('campaigns')
            .insert({
                name: data.name,
                subject: data.subject,
                body: data.body,
                created_by: userId,
            })
            .returning('*');

        if (data.recipientIds && data.recipientIds.length > 0) {
            await CampaignService.addRecipients(campaign.id, data.recipientIds);
        }

        return campaign;
    }

    /**
     * Update a campaign (only allowed in 'draft' status)
     */
    static async update(
        id: string,
        data: { name?: string; subject?: string; body?: string; recipientIds?: string[] },
        userId: string,
    ) {
        const campaign = await db('campaigns').where({ id, created_by: userId }).first();

        if (!campaign) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        if (campaign.status !== 'draft') {
            throw Object.assign(new Error('Can only edit campaigns in draft status'), {
                statusCode: 400,
            });
        }

        // Build update object (only provided fields)
        const updates: Record<string, unknown> = {};
        if (data.name !== undefined) updates.name = data.name;
        if (data.subject !== undefined) updates.subject = data.subject;
        if (data.body !== undefined) updates.body = data.body;

        if (Object.keys(updates).length > 0) {
            updates.updated_at = new Date();
            await db('campaigns').where({ id }).update(updates);
        }

        // Replace recipients if provided
        if (data.recipientIds) {
            await db('campaign_recipients').where({ campaign_id: id }).del();
            if (data.recipientIds.length > 0) {
                await CampaignService.addRecipients(id, data.recipientIds);
            }
        }

        // Return updated campaign
        return db('campaigns').where({ id }).first();
    }

    /**
     * Delete a campaign (only allowed in 'draft' status)
     */
    static async delete(id: string, userId: string): Promise<void> {
        const campaign = await db('campaigns').where({ id, created_by: userId }).first();

        if (!campaign) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        if (campaign.status !== 'draft') {
            throw Object.assign(new Error('Can only delete campaigns in draft status'), {
                statusCode: 400,
            });
        }

        await db('campaigns').where({ id }).del(); // CASCADE deletes campaign_recipients
    }

    /**
     * Schedule a campaign for future sending
     * Transitions status: draft → scheduled
     */
    static async schedule(id: string, scheduledAt: string, userId: string) {
        const campaign = await db('campaigns').where({ id, created_by: userId }).first();

        if (!campaign) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        if (campaign.status !== 'draft') {
            throw Object.assign(new Error('Can only schedule campaigns in draft status'), {
                statusCode: 400,
            });
        }

        // Verify scheduled_at is in the future
        const scheduledDate = new Date(scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
            throw Object.assign(new Error('Invalid date format'), { statusCode: 400 });
        }
        if (scheduledDate <= new Date()) {
            throw Object.assign(new Error('Scheduled time must be in the future'), {
                statusCode: 400,
            });
        }

        // Verify at least 1 recipient
        const [{ count }] = await db('campaign_recipients')
            .where({ campaign_id: id })
            .count<{ count: string }[]>('* as count');

        if (Number(count) === 0) {
            throw Object.assign(new Error('Campaign must have at least one recipient'), {
                statusCode: 400,
            });
        }

        const [updated] = await db('campaigns')
            .where({ id })
            .update({
                status: 'scheduled',
                scheduled_at: new Date(scheduledAt),
                updated_at: new Date(),
            })
            .returning('*');

        return updated;
    }

    /**
     * Send a campaign — enqueues a job per recipient for async processing.
     * Transitions status: draft|scheduled → sending
     * Workers will process each recipient and transition to 'sent' when all done.
     */
    static async send(id: string, userId: string) {
        const campaign = await db('campaigns').where({ id, created_by: userId }).first();

        if (!campaign) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }
        if (campaign.status === 'sent') {
            throw Object.assign(new Error('Campaign has already been sent'), { statusCode: 400 });
        }
        if (campaign.status === 'sending') {
            throw Object.assign(new Error('Campaign is already being sent'), { statusCode: 400 });
        }
        if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
            throw Object.assign(
                new Error('Campaign must be in draft or scheduled status to send'),
                { statusCode: 400 },
            );
        }

        // Verify at least 1 recipient
        const recipients = await db('campaign_recipients')
            .where({ campaign_id: id })
            .select('recipient_id');

        if (recipients.length === 0) {
            throw Object.assign(new Error('Campaign must have at least one recipient'), {
                statusCode: 400,
            });
        }

        // Transition campaign to 'sending'
        const [updated] = await db('campaigns')
            .where({ id })
            .update({ status: 'sending', updated_at: new Date() })
            .returning('*');

        // Enqueue a job for each recipient
        const jobs = recipients.map((r) => ({
            type: 'send_campaign_email' as const,
            payload: { campaign_id: id, recipient_id: r.recipient_id },
        }));

        await JobQueueService.enqueueBatch(jobs);

        console.log(`Campaign ${campaign.name} (${id}): enqueued ${recipients.length} send job(s)`);

        return updated;
    }

    /**
     * Get campaign statistics
     */
    static async getStats(id: string, userId: string): Promise<CampaignStats> {
        const campaign = await db('campaigns').where({ id, created_by: userId }).first();
        if (!campaign) {
            throw Object.assign(new Error('Campaign not found'), { statusCode: 404 });
        }

        const {
            rows: [counts],
        } = await db.raw(
            `SELECT
                COUNT(*)::int                                      AS total,
                COUNT(*) FILTER (WHERE status = 'sent')::int       AS sent,
                COUNT(*) FILTER (WHERE status = 'failed')::int     AS failed,
                COUNT(*) FILTER (WHERE status = 'pending')::int    AS pending,
                COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::int AS opened
            FROM campaign_recipients
            WHERE campaign_id = ?`,
            [id],
        );

        const t = counts.total;
        const s = counts.sent;
        const o = counts.opened;

        return {
            total: t,
            sent: s,
            failed: counts.failed,
            pending: counts.pending,
            opened: o,
            send_rate: t > 0 ? Math.round((s / t) * 100) : 0,
            open_rate: s > 0 ? Math.round((o / s) * 100) : 0,
        };
    }

    // ─── Private helpers ────────────────────────────────────────────

    private static async getRecipientCounts(campaignId: string) {
        const {
            rows: [counts],
        } = await db.raw(
            `SELECT
                COUNT(*)::int                                      AS total_recipients,
                COUNT(*) FILTER (WHERE status = 'sent')::int       AS sent_count,
                COUNT(*) FILTER (WHERE status = 'failed')::int     AS failed_count,
                COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::int AS opened_count
            FROM campaign_recipients
            WHERE campaign_id = ?`,
            [campaignId],
        );

        return counts as {
            total_recipients: number;
            sent_count: number;
            failed_count: number;
            opened_count: number;
        };
    }

    private static async addRecipients(campaignId: string, recipientIds: string[]) {
        const data = recipientIds.map((rid) => ({
            campaign_id: campaignId,
            recipient_id: rid,
        }));

        await db('campaign_recipients')
            .insert(data)
            .onConflict(['campaign_id', 'recipient_id'])
            .ignore();
    }
}
