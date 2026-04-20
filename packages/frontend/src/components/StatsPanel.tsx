import type { CampaignStats } from '@mini-campaign-manager/shared';

interface StatsPanelProps {
    stats: CampaignStats;
}

const statVariants: Record<string, string> = {
    primary: 'text-primary',
    success: 'text-success',
    info: 'text-info',
    warning: 'text-warning',
    error: 'text-error',
};

export function StatsPanel({ stats }: StatsPanelProps) {
    const cards = [
        { label: 'Total Recipients', value: stats.total, variant: 'primary' },
        { label: 'Sent', value: stats.sent, variant: 'success' },
        { label: 'Opened', value: stats.opened, variant: 'info' },
        { label: 'Failed', value: stats.failed, variant: 'error' },
        { label: 'Pending', value: stats.pending, variant: 'warning' },
    ];

    return (
        <div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-surface-2 border border-border rounded-lg p-5 text-center"
                    >
                        <div
                            className={`text-[1.75rem] font-bold leading-none mb-1 ${statVariants[card.variant]}`}
                        >
                            {card.value}
                        </div>
                        <div className="text-xs text-text-muted uppercase tracking-wide">
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
                <div>
                    <div className="flex justify-between text-[0.8125rem] mb-1.5">
                        <span className="text-text-secondary">Send Rate</span>
                        <strong>{stats.send_rate}%</strong>
                    </div>
                    <div className="h-2 bg-surface-hover rounded overflow-hidden">
                        <div
                            className="h-full rounded bg-gradient-to-r from-primary to-[#a78bfa] progress-fill"
                            style={{ width: `${stats.send_rate}%` }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-[0.8125rem] mb-1.5">
                        <span className="text-text-secondary">Open Rate</span>
                        <strong>{stats.open_rate}%</strong>
                    </div>
                    <div className="h-2 bg-surface-hover rounded overflow-hidden">
                        <div
                            className="h-full rounded bg-gradient-to-r from-success to-[#4ade80] progress-fill"
                            style={{ width: `${stats.open_rate}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
