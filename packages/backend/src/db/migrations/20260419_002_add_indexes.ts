import type { Knex } from 'knex';

/**
 * Migration: Add performance indexes
 *
 * PostgreSQL does NOT auto-create indexes for Foreign Key columns.
 * These indexes are critical for query performance at scale (millions of rows).
 */
export async function up(knex: Knex) {
    // 1. Campaigns: list + filter + sort (most frequent query)
    //    Covers: WHERE created_by = ? [AND status = ?] ORDER BY updated_at DESC
    await knex.schema.alterTable('campaigns', (table) => {
        table.index(
            ['created_by', 'status', 'updated_at'],
            'idx_campaigns_created_by_status_updated',
        );
    });

    // 2. CampaignRecipients: count by status per campaign (N+1 pattern)
    //    Covers: WHERE campaign_id = ? AND status = ?
    await knex.schema.alterTable('campaign_recipients', (table) => {
        table.index(['campaign_id', 'status'], 'idx_cr_campaign_status');
    });

    // 3. CampaignRecipients: JOIN to recipients table
    //    Composite PK (campaign_id, recipient_id) only supports prefix lookups
    //    This index enables efficient reverse lookups by recipient_id
    await knex.schema.alterTable('campaign_recipients', (table) => {
        table.index(['recipient_id'], 'idx_cr_recipient_id');
    });

    // 4. CampaignRecipients: open rate counting (partial index)
    //    Covers: WHERE campaign_id = ? AND opened_at IS NOT NULL
    await knex.raw(`
        CREATE INDEX idx_cr_campaign_opened
        ON campaign_recipients (campaign_id, opened_at)
        WHERE opened_at IS NOT NULL
    `);

    // 5. Campaigns: future cron job for auto-sending scheduled campaigns
    //    Covers: WHERE status = 'scheduled' AND scheduled_at <= NOW()
    await knex.raw(`
        CREATE INDEX idx_campaigns_scheduled
        ON campaigns (status, scheduled_at)
        WHERE status = 'scheduled'
    `);

    // 6. Recipients: pagination sort
    //    Covers: ORDER BY created_at DESC LIMIT ? OFFSET ?
    await knex.schema.alterTable('recipients', (table) => {
        table.index(['created_at'], 'idx_recipients_created_at');
    });
}

export async function down(knex: Knex) {
    // Drop in reverse order
    await knex.schema.alterTable('recipients', (table) => {
        table.dropIndex([], 'idx_recipients_created_at');
    });
    await knex.raw('DROP INDEX IF EXISTS idx_campaigns_scheduled');
    await knex.raw('DROP INDEX IF EXISTS idx_cr_campaign_opened');
    await knex.schema.alterTable('campaign_recipients', (table) => {
        table.dropIndex([], 'idx_cr_recipient_id');
    });
    await knex.schema.alterTable('campaign_recipients', (table) => {
        table.dropIndex([], 'idx_cr_campaign_status');
    });
    await knex.schema.alterTable('campaigns', (table) => {
        table.dropIndex([], 'idx_campaigns_created_by_status_updated');
    });
}
