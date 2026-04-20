import { db } from '@/db/connection';
import { RedisLock } from '@/redis/redis-lock';
import { executeJob } from '@/job-queue/job-queue.dispatcher';
import { JobQueue } from '@mini-campaign-manager/shared';

/**
 * Job Queue Worker
 *
 * Processes pending jobs from the `job_queue` table.
 * Uses Redis distributed lock per job to prevent duplicate processing.
 */

// ─── Configuration ───────────────────────────────────────────────────────────

const BATCH_SIZE = 10;
const POOL_SIZE = BATCH_SIZE * 3; // Fetch more to handle contention across instances
const MAX_ATTEMPTS = 3;
const JOB_RETENTION_DAYS = 90;
const RETRY_INTERVAL = '30';

const jobLock = new RedisLock({
    prefix: 'job_lock:',
    ttlSeconds: 60,
    lockValue: () => `${process.pid}:${Date.now()}`,
});

// ─── Core worker logic ──────────────────────────────────────────────────────

/**
 * Fetch a pool of eligible jobs (larger than BATCH_SIZE).
 * Multiple instances may fetch overlapping pools — Redis lock resolves contention.
 */
async function fetchPendingJobs(): Promise<JobQueue[]> {
    const { rows: jobs } = await db.raw(
        `SELECT *
        FROM job_queue
        WHERE status = 'pending'
           OR (
                status = 'failed'
                AND attempts < ?
                AND (last_attempt_at IS NULL OR last_attempt_at < NOW() - INTERVAL '${RETRY_INTERVAL} seconds')
              )
        ORDER BY priority DESC, created_at ASC
        LIMIT ?`,
        [MAX_ATTEMPTS, POOL_SIZE],
    );

    return jobs as JobQueue[];
}

/**
 * Process a single job: acquire Redis lock, execute handler, mark completed or failed.
 * Returns true if the job was processed, false if skipped (locked by another worker).
 */
async function processJob(job: JobQueue): Promise<boolean> {
    // Acquire distributed lock for this specific job
    const locked = await jobLock.acquire(job.id);
    if (!locked) return false; // Another worker is handling this job

    try {
        const claimed = await db('job_queue')
            .where({ id: job.id })
            .whereIn('status', ['pending', 'failed'])
            .update({
                status: 'processing',
                last_attempt_at: new Date(),
                updated_at: new Date(),
            });

        if (claimed === 0) return false;

        await executeJob(job);

        await db('job_queue')
            .where({ id: job.id })
            .update({
                status: 'completed',
                completed_at: new Date(),
                attempts: job.attempts + 1,
                updated_at: new Date(),
            });

        return true;
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const nextAttempts = job.attempts + 1;

        await db('job_queue').where({ id: job.id }).update({
            status: 'failed',
            last_error: errorMessage,
            attempts: nextAttempts,
            updated_at: new Date(),
        });

        console.error(
            `Job ${job.id} [${job.type}] failed (attempt ${nextAttempts}): ${errorMessage}`,
        );

        return true; // Job was attempted (counts as processed)
    } finally {
        await jobLock.release(job.id);
    }
}

/**
 * Cleanup old jobs — delete jobs created more than 90 days ago.
 */
async function cleanupOldJobs(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - JOB_RETENTION_DAYS);

    const deleted = await db('job_queue').where('created_at', '<', cutoffDate).del();

    if (deleted > 0) {
        console.log(`Cleanup: deleted ${deleted} job(s) older than ${JOB_RETENTION_DAYS} days`);
    }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Single tick of the worker — fetch eligible jobs and process in parallel batches.
 * Uses BATCH_SIZE as the concurrency limit per batch.
 * Redis lock + atomic DB claim prevent duplicate processing across instances.
 */
export async function runJobQueueWorker(): Promise<void> {
    try {
        const pool = await fetchPendingJobs();
        if (pool.length === 0) return;

        let processed = 0;

        // Process in parallel batches of BATCH_SIZE, stop once we've processed enough.
        // POOL_SIZE > BATCH_SIZE to handle lock contention — not to increase per-tick throughput.
        for (let i = 0; i < pool.length; i += BATCH_SIZE) {
            const batch = pool.slice(i, i + BATCH_SIZE);
            const results = await Promise.allSettled(batch.map((job) => processJob(job)));

            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    processed++;
                }
            }

            // Stop if we've processed enough jobs for this tick
            if (processed >= BATCH_SIZE) break;
        }

        if (processed > 0) {
            console.log(`Processed ${processed} job(s)`);
        }

        // Cleanup old jobs
        await cleanupOldJobs();
    } catch (err) {
        console.error('Worker tick error:', err);
    }
}
