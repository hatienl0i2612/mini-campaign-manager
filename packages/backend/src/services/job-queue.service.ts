import { db } from '@/db/connection';
import { getRedisClient } from '@/redis/redis';
import type { JobType, JobStatus } from '@mini-campaign-manager/shared';

/**
 * Job Queue Service
 *
 * Enqueues jobs into the `job_queue` PostgreSQL table.
 * Optionally pushes job ID to Redis sorted set for fast polling.
 */

interface EnqueueOptions {
    type: JobType;
    payload: Record<string, unknown>;
    priority?: number; // 0 = normal, higher = more urgent
}

export class JobQueueService {
    /**
     * Enqueue a single job
     */
    static async enqueue(options: EnqueueOptions): Promise<string> {
        const { type, payload, priority = 0 } = options;

        const [job] = await db('job_queue')
            .insert({ type, payload: JSON.stringify(payload), priority })
            .returning('*');

        // Push to Redis sorted set for fast worker pickup
        const redis = getRedisClient();
        if (redis) {
            try {
                await redis.zadd(`job_queue:${type}`, Date.now(), job.id);
            } catch {
                // Job is persisted in DB — worker will pick it up via DB fallback
            }
        }

        return job.id;
    }

    /**
     * Enqueue multiple jobs in a batch (single INSERT)
     */
    static async enqueueBatch(jobs: EnqueueOptions[]): Promise<string[]> {
        if (jobs.length === 0) return [];

        const rows = jobs.map((j) => ({
            type: j.type,
            payload: JSON.stringify(j.payload),
            priority: j.priority ?? 0,
        }));

        const inserted = await db('job_queue').insert(rows).returning('*');
        const jobIds = inserted.map((j) => j.id);

        // Push all to Redis
        const redis = getRedisClient();
        if (redis) {
            try {
                const pipeline = redis.pipeline();
                const now = Date.now();
                for (const job of inserted) {
                    pipeline.zadd(`job_queue:${job.type}`, now, job.id);
                }
                await pipeline.exec();
            } catch {
                // DB fallback will handle it
            }
        }

        return jobIds;
    }

    /**
     * Count pending jobs for a given campaign
     */
    static async countByCampaign(
        campaignId: string,
        statuses: JobStatus[] = ['pending', 'processing'],
    ): Promise<number> {
        const [{ count }] = await db('job_queue')
            .where('type', 'send_campaign_email')
            .whereIn('status', statuses)
            .whereRaw("payload->>'campaign_id' = ?", [campaignId])
            .count<{ count: string }[]>('* as count');

        return Number(count);
    }
}
