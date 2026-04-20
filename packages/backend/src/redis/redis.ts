import Redis from 'ioredis';
import { env } from '@/config/env';

let redisClient: Redis | null = null;

/**
 * Get or create a singleton Redis client.
 * Returns null if REDIS_URL is not configured.
 */
export function getRedisClient(): Redis | null {
    if (!env.REDIS_URL) {
        return null;
    }

    if (!redisClient) {
        redisClient = new Redis(env.REDIS_URL, {
            maxRetriesPerRequest: null,
            retryStrategy: (times) => {
                if (times > 10) return null; // Stop retrying after 10 attempts
                return Math.min(times * 500, 5000);
            },
            lazyConnect: true,
            enableOfflineQueue: true,
        });

        redisClient.on('error', (err) => {
            console.error('Redis error:', err.message);
        });

        redisClient.on('connect', () => {
            console.log('Redis connected');
        });

        redisClient.on('close', () => {
            console.log('Redis disconnected');
        });
    }

    return redisClient;
}

/**
 * Gracefully disconnect Redis.
 */
export async function disconnectRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}
