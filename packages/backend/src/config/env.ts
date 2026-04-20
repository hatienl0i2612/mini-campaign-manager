import { z } from 'zod';
import 'dotenv/config';

const envSchema = z
    .object({
        PORT: z.coerce.number(),
        DATABASE_URL: z.string().url(),
        REDIS_URL: z.string().url(),
        JWT_SECRET: z.string().min(8),
        JWT_EXPIRES_IN: z.string(),
        NODE_ENV: z.enum(['development', 'production', 'test']),
        HOST: z.string(),
        APP_MODE: z.enum(['api', 'worker', 'full']),
    })
    .transform((data) => {
        // Automatic port offset for worker mode in development to avoid EADDRINUSE
        // only if PORT wasn't explicitly set in process.env
        if (data.APP_MODE === 'worker' && !process.env.PORT) {
            return { ...data, PORT: 3002 };
        }
        return data;
    });

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
}

export const env = result.data;

export type AppMode = (typeof env)['APP_MODE'];
