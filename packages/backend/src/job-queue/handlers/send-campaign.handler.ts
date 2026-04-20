import { db } from '@/db/connection';
import { sendEmail } from '@/services/email.service';
import { JobQueue } from '@mini-campaign-manager/shared';

/**
 * Handle sending a campaign email to a single recipient.
 * Simulates email delivery with ~60% open rate.
 */
export async function handleSendCampaignEmail(job: JobQueue): Promise<void> {
    const { campaign_id, recipient_id } = job.payload as {
        campaign_id: string;
        recipient_id: string;
    };

    // Fetch campaign and recipient details
    const campaign = await db('campaigns').where({ id: campaign_id }).first();
    const recipient = await db('recipients').where({ id: recipient_id }).first();

    if (!campaign || !recipient) {
        throw new Error(`Campaign ${campaign_id} or recipient ${recipient_id} not found`);
    }

    // Send email via email service
    await sendEmail({
        to: recipient.email,
        subject: campaign.subject,
        body: campaign.body,
    });

    // Mark this recipient as 'sent'
    const now = new Date();
    await db('campaign_recipients')
        .where({ campaign_id, recipient_id })
        .update({ status: 'sent', sent_at: now });

    // Simulate ~60% open rate
    // TODO: in the future, we should implement this feature to detect when user opened email. Currently, it is mock data
    if (Math.random() < 0.6) {
        const minutesLater = Math.floor(Math.random() * 60) + 1;
        await db('campaign_recipients')
            .where({ campaign_id, recipient_id })
            .update({
                opened_at: new Date(now.getTime() + minutesLater * 60 * 1000),
            });
    }

    // Check if all recipients for this campaign have been processed
    const [{ pending_count }] = await db('campaign_recipients')
        .where({ campaign_id, status: 'pending' })
        .count<{ pending_count: string }[]>('* as pending_count');

    if (Number(pending_count) === 0) {
        // All recipients processed — transition campaign to 'sent'
        await db('campaigns')
            .where({ id: campaign_id, status: 'sending' })
            .update({ status: 'sent', updated_at: new Date() });
    }
}
