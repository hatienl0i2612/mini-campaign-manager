import { FastifyInstance } from 'fastify';
import { authenticate } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import { CampaignService } from '@/services/campaign.service';
import {
    createCampaignSchema,
    updateCampaignSchema,
    scheduleCampaignSchema,
} from '@mini-campaign-manager/shared';
import type {
    CreateCampaignInput,
    UpdateCampaignInput,
    ScheduleCampaignInput,
} from '@mini-campaign-manager/shared';

/**
 * Campaign controller (all protected — require JWT)
 */
export async function campaignController(app: FastifyInstance) {
    // All campaign routes require authentication
    app.addHook('preHandler', authenticate);

    // GET / — List campaigns
    app.get<{
        Querystring: { page?: string; limit?: string; status?: string };
    }>('/', async (request, reply) => {
        try {
            const user = request.user as { userId: string };
            const page = parseInt(request.query.page || '1', 10);
            const limit = parseInt(request.query.limit || '10', 10);
            const status = request.query.status || undefined;

            const result = await CampaignService.findAll(user.userId, page, limit, status);
            reply.send(result);
        } catch (error: unknown) {
            const err = error as Error & { statusCode?: number };
            reply.status(err.statusCode || 500).send({ error: err.message });
        }
    });

    // GET /:id — Get campaign detail
    app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
        try {
            const user = request.user as { userId: string };
            const campaign = await CampaignService.findById(request.params.id, user.userId);
            if (!campaign) {
                reply.status(404).send({ error: 'Campaign not found' });
                return;
            }
            reply.send(campaign);
        } catch (error: unknown) {
            const err = error as Error & { statusCode?: number };
            reply.status(err.statusCode || 500).send({ error: err.message });
        }
    });

    // GET /:id/stats — Get campaign stats
    app.get<{ Params: { id: string } }>('/:id/stats', async (request, reply) => {
        try {
            const user = request.user as { userId: string };
            const stats = await CampaignService.getStats(request.params.id, user.userId);
            reply.send(stats);
        } catch (error: unknown) {
            const err = error as Error & { statusCode?: number };
            reply.status(err.statusCode || 500).send({ error: err.message });
        }
    });

    // POST / — Create campaign
    app.post<{ Body: CreateCampaignInput }>(
        '/',
        { preHandler: [validateBody(createCampaignSchema)] },
        async (request, reply) => {
            try {
                const user = request.user as { userId: string };
                const campaign = await CampaignService.create(request.body, user.userId);
                reply.status(201).send(campaign);
            } catch (error: unknown) {
                const err = error as Error & { statusCode?: number };
                reply.status(err.statusCode || 500).send({ error: err.message });
            }
        },
    );

    // PUT /:id — Update campaign
    app.put<{ Params: { id: string }; Body: UpdateCampaignInput }>(
        '/:id',
        { preHandler: [validateBody(updateCampaignSchema)] },
        async (request, reply) => {
            try {
                const user = request.user as { userId: string };
                const campaign = await CampaignService.update(
                    request.params.id,
                    request.body,
                    user.userId,
                );
                reply.send(campaign);
            } catch (error: unknown) {
                const err = error as Error & { statusCode?: number };
                reply.status(err.statusCode || 500).send({ error: err.message });
            }
        },
    );

    // DELETE /:id — Delete campaign
    app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
        try {
            const user = request.user as { userId: string };
            await CampaignService.delete(request.params.id, user.userId);
            reply.status(204).send();
        } catch (error: unknown) {
            const err = error as Error & { statusCode?: number };
            reply.status(err.statusCode || 500).send({ error: err.message });
        }
    });

    // POST /:id/schedule — Schedule campaign
    app.post<{ Params: { id: string }; Body: ScheduleCampaignInput }>(
        '/:id/schedule',
        { preHandler: [validateBody(scheduleCampaignSchema)] },
        async (request, reply) => {
            try {
                const user = request.user as { userId: string };
                const campaign = await CampaignService.schedule(
                    request.params.id,
                    request.body.scheduled_at,
                    user.userId,
                );
                reply.send(campaign);
            } catch (error: unknown) {
                const err = error as Error & { statusCode?: number };
                reply.status(err.statusCode || 500).send({ error: err.message });
            }
        },
    );

    // POST /:id/send — Send campaign (simulated)
    app.post<{ Params: { id: string } }>('/:id/send', async (request, reply) => {
        try {
            const user = request.user as { userId: string };
            const campaign = await CampaignService.send(request.params.id, user.userId);
            reply.send(campaign);
        } catch (error: unknown) {
            const err = error as Error & { statusCode?: number };
            reply.status(err.statusCode || 500).send({ error: err.message });
        }
    });
}
