import { FastifyInstance } from 'fastify';
import { AuthService } from '@/services/auth.service';
import { authenticate } from '@/middleware/auth.middleware';
import { validateBody } from '@/middleware/validate.middleware';
import { registerSchema, loginSchema } from '@mini-campaign-manager/shared';
import type { RegisterInput, LoginInput } from '@mini-campaign-manager/shared';

/**
 * Auth controller
 *
 * POST /api/auth/register — Register a new user
 * POST /api/auth/login    — Login and get JWT token
 * GET  /api/auth/me       — Get current user (verify token)
 */
export async function authController(app: FastifyInstance) {
    // POST /register
    app.post<{ Body: RegisterInput }>(
        '/register',
        { preHandler: [validateBody(registerSchema)] },
        async (request, reply) => {
            try {
                const result = await AuthService.register(
                    request.body.email,
                    request.body.name,
                    request.body.password,
                    app,
                );
                reply.status(201).send(result);
            } catch (error: unknown) {
                const err = error as Error & { statusCode?: number };
                reply.status(err.statusCode || 500).send({ error: err.message });
            }
        },
    );

    // POST /login
    app.post<{ Body: LoginInput }>(
        '/login',
        { preHandler: [validateBody(loginSchema)] },
        async (request, reply) => {
            try {
                const result = await AuthService.login(
                    request.body.email,
                    request.body.password,
                    app,
                );
                reply.send(result);
            } catch (error: unknown) {
                const err = error as Error & { statusCode?: number };
                reply.status(err.statusCode || 500).send({ error: err.message });
            }
        },
    );

    // GET /me — Get current authenticated user
    app.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
        try {
            const { userId } = request.user as { userId: string };
            const user = await AuthService.getMe(userId);
            reply.send({ user });
        } catch (error: unknown) {
            const err = error as Error & { statusCode?: number };
            reply.status(err.statusCode || 500).send({ error: err.message });
        }
    });
}
