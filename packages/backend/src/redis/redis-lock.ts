import { getRedisClient } from '@/redis/redis';

/**
 * Options for creating a RedisLock instance.
 */
interface RedisLockOptions {
    /** The key prefix used for all lock keys, e.g. `'vad_lock:'` */
    prefix: string;
    /** TTL in seconds for acquired locks. Default: 300 (5 minutes) */
    ttlSeconds?: number;
    /**
     * Value stored in Redis for the lock.
     * Can be a static string or a function that returns a dynamic value.
     * Default: `'1'`
     */
    lockValue?: string | (() => string);
}

/**
 * A generic, reusable Redis distributed lock.
 *
 * Provides acquire/release/count operations backed by Redis `SET … NX EX`.
 * If Redis is unavailable, all operations degrade gracefully:
 *   - `acquire()` returns `true`  (allow processing)
 *   - `release()` is a no-op
 *   - `getInflightCount()` returns `0`
 *
 * @example
 * ```ts
 * const vadLock = new RedisLock({ prefix: 'vad_lock:', ttlSeconds: 3600 });
 *
 * const acquired = await vadLock.acquire(recordingId);
 * if (!acquired) return; // already locked
 *
 * try {
 *   // … do work …
 * } finally {
 *   await vadLock.release(recordingId);
 * }
 * ```
 *
 * @example Multi-segment keys
 * ```ts
 * const asmLock = new RedisLock({ prefix: 'asm_lock:', ttlSeconds: 3600 });
 *
 * await asmLock.acquire(`${orgId}:${recordingId}`);
 * await asmLock.release(`${orgId}:${recordingId}`);
 * const count = await asmLock.getInflightCount(`${orgId}:*`);
 * ```
 *
 * @example Worker-stamped value
 * ```ts
 * const lock = new RedisLock({
 *   prefix: 'job_lock:',
 *   ttlSeconds: 60,
 *   lockValue: () => `worker_${Date.now()}`,
 * });
 * ```
 */
export class RedisLock {
    private readonly prefix: string;
    private readonly ttlSeconds: number;
    private readonly lockValue: string | (() => string);

    constructor(options: RedisLockOptions) {
        this.prefix = options.prefix;
        this.ttlSeconds = options.ttlSeconds ?? 300;
        this.lockValue = options.lockValue ?? '1';
    }

    /**
     * Build the full Redis key from the given key suffix.
     *
     * @param keySuffix - Unique identifier (e.g. `recordingId` or `orgId:recordingId`)
     */
    private buildKey(keySuffix: string): string {
        return `${this.prefix}${keySuffix}`;
    }

    /** Resolve the lock value to store in Redis. */
    private resolveLockValue(): string {
        return typeof this.lockValue === 'function' ? this.lockValue() : this.lockValue;
    }

    /**
     * Attempt to acquire the lock for `keySuffix`.
     *
     * Uses `SET key value EX ttl NX` to guarantee atomicity.
     * Returns `true` only if this caller acquired the lock.
     * Returns `true` when Redis is unavailable (graceful degradation).
     *
     * @param keySuffix - Unique identifier for the resource to lock
     * @param ttlOverride - Optional TTL override for this specific acquisition (seconds)
     */
    async acquire(keySuffix: string, ttlOverride?: number): Promise<boolean> {
        const redis = getRedisClient();
        if (!redis) return true; // No Redis — degrade gracefully

        const key = this.buildKey(keySuffix);
        const ttl = ttlOverride ?? this.ttlSeconds;
        const result = await redis.set(key, this.resolveLockValue(), 'EX', ttl, 'NX');
        return result === 'OK';
    }

    /**
     * Release the lock for `keySuffix`.
     *
     * Deletes the key unconditionally.
     * No-op when Redis is unavailable.
     *
     * @param keySuffix - Unique identifier for the resource to unlock
     */
    async release(keySuffix: string): Promise<void> {
        const redis = getRedisClient();
        if (!redis) return;

        const key = this.buildKey(keySuffix);
        await redis.del(key);
    }

    /**
     * Extend / refresh the TTL of an existing lock.
     *
     * Useful for long-running tasks that need to keep the lock alive.
     * No-op when Redis is unavailable or the key does not exist.
     *
     * @param keySuffix - Unique identifier for the locked resource
     * @param ttlOverride - Optional TTL override (seconds), defaults to the instance TTL
     */
    async extend(keySuffix: string, ttlOverride?: number): Promise<void> {
        const redis = getRedisClient();
        if (!redis) return;

        const key = this.buildKey(keySuffix);
        const ttl = ttlOverride ?? this.ttlSeconds;
        await redis.expire(key, ttl);
    }

    /**
     * Count the number of currently held locks matching a key pattern.
     *
     * Uses `KEYS <prefix><pattern>` — acceptable at low volume.
     * Replace with a counter or SCAN if high scale is needed.
     *
     * @param pattern - Glob pattern appended to the prefix
     *                  e.g. `'*'` for all, or `'orgId:*'` for a specific org
     * @returns Number of matching keys; `0` when Redis is unavailable
     */
    async getInflightCount(pattern = '*'): Promise<number> {
        const redis = getRedisClient();
        if (!redis) return 0;

        const keys = await redis.keys(`${this.prefix}${pattern}`);
        return keys.length;
    }

    /**
     * Check whether a lock is currently held for the given keySuffix.
     *
     * @param keySuffix - Unique identifier for the resource
     * @returns `true` if the lock exists, `false` otherwise (or when Redis is unavailable)
     */
    async isLocked(keySuffix: string): Promise<boolean> {
        const redis = getRedisClient();
        if (!redis) return false;

        const key = this.buildKey(keySuffix);
        const exists = await redis.exists(key);
        return exists === 1;
    }

    /**
     * Get the value stored in a lock key.
     *
     * Useful when the lock value encodes owner information
     * (e.g. `userId|timestamp` or `workerId|timestamp`).
     *
     * @param keySuffix - Unique identifier for the resource
     * @returns The stored value, or `null` if the lock doesn't exist / Redis is unavailable
     */
    async getLockValue(keySuffix: string): Promise<string | null> {
        const redis = getRedisClient();
        if (!redis) return null;

        const key = this.buildKey(keySuffix);
        return redis.get(key);
    }
}
