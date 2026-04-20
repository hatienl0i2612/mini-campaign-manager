import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';

/**
 * Creates a Fastify preHandler hook that validates request body against a Zod schema.
 */
export function validateBody(schema: ZodSchema) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            request.body = schema.parse(request.body);
        } catch (error) {
            if (error instanceof ZodError) {
                reply.status(400).send({
                    error: 'Validation failed',
                    details: error.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
                return;
            }
            throw error;
        }
    };
}
