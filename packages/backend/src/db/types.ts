import type { Knex } from 'knex';
import type {
    Campaign,
    CampaignRecipient,
    JobQueue,
    JobQueueInsert,
    Migration,
    MigrationLock,
    Recipient,
    User,
} from '@mini-campaign-manager/shared';

export type UserRow = User;
export type CampaignRow = Campaign;
export type RecipientRow = Recipient;
export type CampaignRecipientRow = CampaignRecipient;
export type JobQueueRow = JobQueue;

declare module 'knex/types/tables' {
    interface Tables {
        users: Knex.CompositeTableType<UserRow, Partial<UserRow>, Partial<UserRow>>;
        campaigns: Knex.CompositeTableType<CampaignRow, Partial<CampaignRow>, Partial<CampaignRow>>;
        recipients: Knex.CompositeTableType<
            RecipientRow,
            Partial<RecipientRow>,
            Partial<RecipientRow>
        >;
        campaign_recipients: Knex.CompositeTableType<
            CampaignRecipientRow,
            Partial<CampaignRecipientRow>,
            Partial<CampaignRecipientRow>
        >;
        job_queue: Knex.CompositeTableType<JobQueueRow, JobQueueInsert, Partial<JobQueueRow>>;
        knex_migrations: Knex.CompositeTableType<Migration>;
        knex_migrations_lock: Knex.CompositeTableType<MigrationLock>;
    }
}
