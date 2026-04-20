/**
 * Campaign-related type definitions
 */

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent';

export interface Campaign {
    id: string;
    name: string;
    subject: string;
    body: string;
    status: CampaignStatus;
    scheduled_at: Date | null;
    created_by: string;
    created_at: Date;
    updated_at: Date;
}

/** Campaign with aggregated stats — returned from list/detail endpoints */
export interface CampaignWithStats extends Campaign {
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    opened_count: number;
}

/** Campaign detail — includes recipient list */
export interface CampaignDetail extends CampaignWithStats {
    recipients: CampaignRecipientDetail[];
}

export interface CampaignRecipientDetail {
    id: string;
    email: string;
    name: string | null;
    delivery_status: CampaignRecipientStatus;
    sent_at: Date | null;
    opened_at: Date | null;
}

export type CampaignRecipientStatus = 'pending' | 'sent' | 'failed';

export interface CampaignRecipient {
    campaign_id: string;
    recipient_id: string;
    status: CampaignRecipientStatus;
    sent_at: Date | null;
    opened_at: Date | null;
}

/** Campaign stats response */
export interface CampaignStats {
    total: number;
    sent: number;
    failed: number;
    opened: number;
    pending: number;
    open_rate: number;
    send_rate: number;
}

