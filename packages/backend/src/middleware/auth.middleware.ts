import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Fastify preHandler hook for JWT authentication.
 * Extracts and verifies the JWT token from the Authorization header.
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch {
        reply.status(401).send({ error: 'Authentication required' });
    }
}
