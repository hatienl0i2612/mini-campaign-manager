/**
 * Job Queue type definitions
 */

export type JobType = 'send_campaign_email';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobQueue {
    id: string;
    type: JobType;
    payload: Record<string, unknown>;
    status: JobStatus;
    priority: number;
    attempts: number;
    max_attempts: number;
    last_error: string | null;
    last_attempt_at: Date | null;
    completed_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

/** Insert type for job_queue — payload accepts string (JSON.stringify) for DB inserts */
export interface JobQueueInsert {
    id?: string;
    type: string;
    payload: string | Record<string, unknown>;
    status?: string;
    priority?: number;
    attempts?: number;
    max_attempts?: number;
    last_error?: string | null;
    last_attempt_at?: Date | null;
    completed_at?: Date | null;
}
