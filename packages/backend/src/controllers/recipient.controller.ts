import { FastifyInstance } from 'fastify';
import { authenticate } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import { RecipientService } from '@/services/recipient.service';
import { createRecipientSchema, createRecipientBulkSchema } from '@mini-campaign-manager/shared';
import type { CreateRecipientInput, CreateRecipientBulkInput } from '@mini-campaign-manager/shared';

/**
 * Recipient controller (all protected — require JWT)
 */
export async function recipientController(app: FastifyInstance) {
    // All recipient routes require authentication
    app.addHook('preHandler', authenticate);

    // GET / — List recipients
    app.get<{
        Querystring: { page?: string; limit?: string };
    }>('/', async (request, reply) => {
        try {
            const page = parseInt(request.query.page || '1', 10);
            const limit = parseInt(request.query.limit || '10', 10);
            const result = await RecipientService.findAll(page, limit);
            reply.send(result);
        } catch (error: unknown) {
            const err = error as Error & { statusCode?: number };
            reply.status(err.statusCode || 500).send({ error: err.message });
        }
    });

    // POST / — Create recipient
    app.post<{ Body: CreateRecipientInput }>(
        '/',
        { preHandler: [validateBody(createRecipientSchema)] },
        async (request, reply) => {
            try {
                const recipient = await RecipientService.create(
                    request.body.email,
                    request.body.name,
                );
                reply.status(201).send(recipient);
            } catch (error: unknown) {
                const err = error as Error & { statusCode?: number };
                reply.status(err.statusCode || 500).send({ error: err.message });
            }
        },
    );

    // POST /bulk — Bulk create recipients
    app.post<{ Body: CreateRecipientBulkInput }>(
        '/bulk',
        { preHandler: [validateBody(createRecipientBulkSchema)] },
        async (request, reply) => {
            try {
                const result = await RecipientService.bulkCreate(request.body.recipients);
                reply.status(201).send(result);
            } catch (error: unknown) {
                const err = error as Error & { statusCode?: number };
                reply.status(err.statusCode || 500).send({ error: err.message });
            }
        },
    );

    // DELETE /:id — Delete recipient
    app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
        try {
            await RecipientService.delete(request.params.id);
            reply.status(204).send();
        } catch (error: unknown) {
            const err = error as Error & { statusCode?: number };
            reply.status(err.statusCode || 500).send({ error: err.message });
        }
    });
}
