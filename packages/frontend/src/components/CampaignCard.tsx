import type { CampaignWithStats } from '@mini-campaign-manager/shared';
import { Users, Mail, Eye, CalendarDays, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface CampaignCardProps {
    campaign: CampaignWithStats;
    onClick?: () => void;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
    return (
        <div
            className="bg-surface border border-border rounded-lg p-5 cursor-pointer transition-all duration-150 hover:border-border-hover hover:-translate-y-0.5 hover:shadow-lg"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold leading-snug">{campaign.name}</h3>
                <StatusBadge status={campaign.status} />
            </div>
            <p className="text-text-secondary text-sm mb-4">{campaign.subject}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 border-t border-border text-[0.8125rem] text-text-muted">
                <div className="flex items-center gap-1.5">
                    <Users size={14} />{' '}
                    <strong className="text-text font-semibold">{campaign.total_recipients}</strong>{' '}
                    recipients
                </div>
                {campaign.status === 'sent' && (
                    <>
                        <div className="flex items-center gap-1.5">
                            <Mail size={14} />{' '}
                            <strong className="text-text font-semibold">
                                {campaign.sent_count}
                            </strong>{' '}
                            sent
                        </div>
                        <div className="flex items-center gap-1.5">
                            <AlertCircle
                                size={14}
                                className={campaign.failed_count > 0 ? 'text-error' : ''}
                            />{' '}
                            <strong className="text-text font-semibold">
                                {campaign.failed_count}
                            </strong>{' '}
                            failed
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye size={14} />{' '}
                            <strong className="text-text font-semibold">
                                {campaign.opened_count}
                            </strong>{' '}
                            opened
                        </div>
                    </>
                )}
                {campaign.scheduled_at && campaign.status === 'scheduled' && (
                    <div className="flex items-center gap-1.5">
                        <CalendarDays size={14} />{' '}
                        {new Date(campaign.scheduled_at).toLocaleDateString()}
                    </div>
                )}
            </div>
        </div>
    );
}
