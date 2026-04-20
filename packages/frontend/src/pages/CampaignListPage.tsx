import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAppSelector, useAppDispatch } from '@/hooks/useStore';
import { setStatusFilter, setPage } from '@/store/slices/campaignSlice';
import { CampaignCard } from '@/components/CampaignCard';
import { CampaignCardSkeleton } from '@/components/Skeleton';
import { Pagination } from '@/components/Pagination';
import type { CampaignStatus } from '@mini-campaign-manager/shared';

const TABS: { label: string; value: CampaignStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Sent', value: 'sent' },
];

export function CampaignListPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { statusFilter, page, limit } = useAppSelector((state) => state.campaign);

    const { data, isLoading } = useCampaigns({
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Campaigns</h2>
                <button
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium bg-primary text-white hover:bg-primary-hover hover:-translate-y-px hover:shadow"
                    onClick={() => navigate('/campaigns/new')}
                >
                    <Plus size={16} /> New Campaign
                </button>
            </div>

            <div className="flex gap-1 bg-surface border border-border rounded-lg p-1 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.value}
                        className={`px-4 py-2 rounded text-[0.8125rem] font-medium cursor-pointer transition-all duration-150 ${
                            statusFilter === tab.value
                                ? 'bg-primary-dim text-primary-hover'
                                : 'text-text-secondary bg-transparent hover:text-text'
                        }`}
                        onClick={() => dispatch(setStatusFilter(tab.value))}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CampaignCardSkeleton key={i} />
                    ))}
                </div>
            ) : !data?.data.length ? (
                <div className="text-center py-16 px-8 text-text-muted">
                    <h3 className="text-lg text-text-secondary mb-2">No campaigns found</h3>
                    <p>Create your first campaign to get started.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4">
                        {data.data.map((campaign) => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={data.pagination.totalPages}
                        onPageChange={(p) => dispatch(setPage(p))}
                    />
                </>
            )}
        </div>
    );
}
