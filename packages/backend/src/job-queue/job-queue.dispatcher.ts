import { JobQueue } from '@mini-campaign-manager/shared';
import { handleSendCampaignEmail } from './handlers/send-campaign.handler';

/**
 * Job dispatcher — maps job types to their handler functions.
 * To add a new job type, create a handler file and register it here.
 */
const JOB_HANDLERS: Record<string, (job: JobQueue) => Promise<void>> = {
    send_campaign_email: handleSendCampaignEmail,
};

export async function executeJob(job: JobQueue): Promise<void> {
    const handler = JOB_HANDLERS[job.type];
    if (!handler) {
        throw new Error(`No handler for job type: ${job.type}`);
    }
    await handler(job);
}
