import type { CampaignRecipientStatus, CampaignStatus } from '@mini-campaign-manager/shared';

/**
 * StatusBadge — renders a color-coded badge for campaign or delivery status
 *
 * - draft → grey
 * - scheduled → blue
 * - sending → amber/warning
 * - sent → green
 * - pending → grey
 * - failed → red
 */

interface StatusBadgeProps {
    status: CampaignStatus | CampaignRecipientStatus;
}

const badgeStyles: Record<CampaignStatus | CampaignRecipientStatus, string> = {
    draft: 'bg-status-draft-bg text-status-draft',
    scheduled: 'bg-status-scheduled-bg text-status-scheduled',
    sending: 'bg-warning-dim text-warning',
    sent: 'bg-status-sent-bg text-status-sent',
    pending: 'bg-status-draft-bg text-status-draft',
    failed: 'bg-error-dim text-error',
};

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${badgeStyles[status] || ''}`}
        >
            {status}
        </span>
    );
}
