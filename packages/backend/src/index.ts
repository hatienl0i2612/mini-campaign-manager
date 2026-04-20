import 'dotenv/config';
import { buildApp } from '@/app';
import { env } from '@/config/env';
import { db } from '@/db/connection';
import { getRedisClient, disconnectRedis } from '@/redis/redis';

async function main() {
    const app = await buildApp();

    // Test database connection
    await db.raw('SELECT 1+1 AS result');
    console.log('Database connected');

    // Connect Redis
    const redis = getRedisClient();
    if (redis) {
        await redis.connect();
    }

    // Start server (api/full) or just initialize (worker)
    if (env.APP_MODE === 'worker') {
        await app.ready();
        console.log('Worker started');
    } else {
        await app.listen({ port: env.PORT, host: env.HOST });
        console.log(`Server running on http://localhost:${env.PORT}`);
    }

    // Graceful shutdown
    const shutdown = async () => {
        console.log('\nShutting down...');
        await disconnectRedis();
        await app.close(); // @fastify/schedule auto-stops all jobs on close
        await db.destroy();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

main().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
