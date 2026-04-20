import type { Knex } from 'knex';

/**
 * Migration: Create job_queue table + add 'sending' campaign status
 *
 * The job_queue table stores async jobs (e.g., sending emails to individual recipients).
 * Workers poll this table every 5 seconds to process pending jobs.
 */
export async function up(knex: Knex) {
    // 1. Add 'sending' to campaigns status enum
    //    Knex uses CHECK constraints for enums on PostgreSQL
    await knex.raw(`
        ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
        ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
            CHECK (status IN ('draft', 'scheduled', 'sending', 'sent'));
    `);

    // 2. Create job_queue table
    await knex.schema.createTable('job_queue', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('type', 100).notNullable(); // e.g. 'send_campaign_email'
        table.jsonb('payload').notNullable().defaultTo('{}');
        table
            .string('status', 20)
            .notNullable()
            .defaultTo('pending'); // pending | processing | completed | failed
        table.integer('priority').notNullable().defaultTo(0); // higher = more urgent
        table.integer('attempts').notNullable().defaultTo(0);
        table.integer('max_attempts').notNullable().defaultTo(3);
        table.text('last_error').nullable();
        table.timestamp('last_attempt_at').nullable();
        table.timestamp('completed_at').nullable();
        table.timestamps(true, true); // created_at, updated_at
    });

    // 3. Indexes for worker polling
    //    Worker query: WHERE status = 'pending' ORDER BY priority DESC, created_at ASC LIMIT 20
    await knex.raw(`
        CREATE INDEX idx_job_queue_pending
        ON job_queue (status, priority DESC, created_at ASC)
        WHERE status IN ('pending', 'failed');
    `);

    // Index for looking up jobs by type + campaign (for checking completion)
    await knex.raw(`
        CREATE INDEX idx_job_queue_type_payload
        ON job_queue (type, status)
        WHERE status != 'completed';
    `);
}

export async function down(knex: Knex) {
    await knex.schema.dropTableIfExists('job_queue');

    // Revert campaign status enum (remove 'sending')
    await knex.raw(`
        UPDATE campaigns SET status = 'draft' WHERE status = 'sending';
        ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
        ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
            CHECK (status IN ('draft', 'scheduled', 'sent'));
    `);
}
