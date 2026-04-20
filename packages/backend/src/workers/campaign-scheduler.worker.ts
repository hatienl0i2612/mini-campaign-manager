import { db } from '@/db/connection';
import { RedisLock } from '@/redis/redis-lock';
import { CampaignService } from '@/services/campaign.service';

/**
 * Campaign Scheduler Worker
 *
 * Checks for campaigns with status 'scheduled' whose scheduled_at has passed.
 * Triggers the send flow by reusing CampaignService.send().
 *
 * Uses a Redis lock to prevent multiple instances from processing the same campaign.
 */

const schedulerLock = new RedisLock({
    prefix: 'campaign_scheduler:',
    ttlSeconds: 30,
    lockValue: () => `${process.pid}:${Date.now()}`,
});

/**
 * Find all campaigns that are due to be sent.
 */
async function findDueCampaigns() {
    return db('campaigns')
        .where({ status: 'scheduled' })
        .where('scheduled_at', '<=', new Date())
        .select('id', 'name', 'created_by');
}

/**
 * Trigger the send flow for a single campaign using CampaignService.send().
 */
async function triggerCampaign(campaign: { id: string; name: string; created_by: string }) {
    const locked = await schedulerLock.acquire(campaign.id);
    if (!locked) return;

    try {
        await CampaignService.send(campaign.id, campaign.created_by);
        console.log(`Scheduled campaign "${campaign.name}" triggered`);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Failed to trigger scheduled campaign "${campaign.name}": ${message}`);
    } finally {
        await schedulerLock.release(campaign.id);
    }
}

/**
 * Main tick — called by the interval scheduler in app.ts
 */
export async function runCampaignScheduler(): Promise<void> {
    try {
        const dueCampaigns = await findDueCampaigns();
        if (dueCampaigns.length === 0) return;

        for (const campaign of dueCampaigns) {
            await triggerCampaign(campaign);
        }
    } catch (err) {
        console.error('Campaign scheduler error:', err);
    }
}
