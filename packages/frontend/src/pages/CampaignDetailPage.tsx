import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Mail,
    CalendarDays,
    Clock,
    CalendarPlus,
    Send,
    Trash2,
    Edit,
    FileText,
    Users,
    RefreshCw,
} from 'lucide-react';
import {
    useCampaign,
    useCampaignStats,
    useSendCampaign,
    useDeleteCampaign,
    useScheduleCampaign,
    useUpdateCampaign,
} from '@/hooks/useCampaigns';
import { StatusBadge } from '@/components/StatusBadge';
import { StatsPanel } from '@/components/StatsPanel';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ScheduleDialog } from '@/components/ScheduleDialog';

import { CampaignForm } from '@/components/CampaignForm';
import { CampaignDetailSkeleton } from '@/components/Skeleton';

type ConfirmAction = 'send' | 'delete' | null;

export function CampaignDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        data: campaign,
        isLoading,
        refetch: refetchCampaign,
        isFetching: isFetchingCampaign,
    } = useCampaign(id!);
    const {
        data: stats,
        refetch: refetchStats,
        isFetching: isFetchingStats,
    } = useCampaignStats(id!);
    const sendMutation = useSendCampaign();
    const deleteMutation = useDeleteCampaign();
    const scheduleMutation = useScheduleCampaign();
    const updateMutation = useUpdateCampaign();
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = async (data: {
        name: string;
        subject: string;
        body: string;
        recipientIds: string[];
    }) => {
        await updateMutation.mutateAsync({
            id: id!,
            data,
        });
        setIsEditing(false);
        toast.success('Campaign updated!');
    };

    const handleSend = async () => {
        try {
            await sendMutation.mutateAsync(id!);
            setConfirmAction(null);
            toast.success('Campaign sent successfully!');
        } catch (err: unknown) {
            setConfirmAction(null);
            const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Send failed';
            toast.error(msg || 'Send failed');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(id!);
            setConfirmAction(null);
            navigate('/campaigns');
            toast.success('Campaign deleted!');
        } catch (err: unknown) {
            setConfirmAction(null);
            const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Delete failed';
            toast.error(msg || 'Delete failed');
        }
    };

    const handleSchedule = async (scheduledAt: Date) => {
        try {
            await scheduleMutation.mutateAsync({
                id: id!,
                data: { scheduled_at: scheduledAt.toISOString() },
            });
            setShowSchedule(false);
            toast.success('Campaign scheduled!');
        } catch (err: unknown) {
            setShowSchedule(false);
            const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Schedule failed';
            toast.error(msg || 'Schedule failed');
        }
    };

    if (isLoading) {
        return <CampaignDetailSkeleton />;
    }
    if (!campaign) {
        return (
            <div className="text-center py-16 px-8 text-text-muted">
                <h3 className="text-lg text-text-secondary mb-2">Campaign not found</h3>
            </div>
        );
    }

    const isDraft = campaign.status === 'draft';
    const isScheduled = campaign.status === 'scheduled';
    const isSent = campaign.status === 'sent';

    const btnSm =
        'inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded text-[0.8125rem] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

    return (
        <div className="max-w-[900px]">
            <Link
                to="/campaigns"
                className="inline-flex items-center gap-1.5 text-text-secondary text-sm mb-6 hover:text-text transition-colors"
            >
                <ArrowLeft size={16} /> Back to Campaigns
            </Link>

            {isEditing ? (
                <div className="mb-8">
                    <CampaignForm
                        title="Edit Campaign"
                        submitLabel="Save Changes"
                        isLoading={updateMutation.isPending}
                        onSubmit={handleUpdate}
                        onCancel={() => setIsEditing(false)}
                        initialData={{
                            name: campaign.name,
                            subject: campaign.subject,
                            body: campaign.body,
                            recipientIds: campaign.recipients?.map((r) => r.id) || [],
                        }}
                    />
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-4 mb-2 justify-between">
                        <div className="flex gap-2 items-center">
                            <h2 className="text-2xl font-bold">{campaign.name}</h2>
                            <StatusBadge status={campaign.status} />
                        </div>
                        <button
                            onClick={() => {
                                refetchCampaign();
                                refetchStats();
                            }}
                            className="p-1.5 text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
                            title="Refresh data"
                            disabled={isFetchingCampaign || isFetchingStats}
                        >
                            <RefreshCw
                                size={18}
                                className={
                                    isFetchingCampaign || isFetchingStats ? 'animate-spin' : ''
                                }
                            />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-text-secondary text-sm mb-8">
                        <span className="inline-flex items-center gap-1.5">
                            <Mail size={14} /> {campaign.subject}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} /> Created{' '}
                            {new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                        {campaign.scheduled_at && (
                            <span className="inline-flex items-center gap-1.5">
                                <Clock size={14} /> Scheduled{' '}
                                {new Date(campaign.scheduled_at).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2 mb-8">
                        {isDraft && (
                            <>
                                <button
                                    className={`${btnSm} bg-surface-hover text-text-secondary hover:text-text`}
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Edit size={15} /> Edit
                                </button>
                                <button
                                    className={`${btnSm} bg-primary text-white hover:bg-primary-hover`}
                                    onClick={() => setShowSchedule(true)}
                                    disabled={scheduleMutation.isPending}
                                >
                                    <CalendarPlus size={15} /> Schedule
                                </button>
                                <button
                                    className={`${btnSm} bg-success-dim text-success hover:bg-success hover:text-white`}
                                    onClick={() => setConfirmAction('send')}
                                    disabled={sendMutation.isPending}
                                >
                                    <Send size={15} /> Send Now
                                </button>
                                <button
                                    className={`${btnSm} bg-error-dim text-error hover:bg-error hover:text-white`}
                                    onClick={() => setConfirmAction('delete')}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 size={15} /> Delete
                                </button>
                            </>
                        )}
                        {isScheduled && (
                            <button
                                className={`${btnSm} bg-success-dim text-success hover:bg-success hover:text-white`}
                                onClick={() => setConfirmAction('send')}
                                disabled={sendMutation.isPending}
                            >
                                <Send size={15} /> Send Now
                            </button>
                        )}
                    </div>
                </>
            )}

            {stats && isSent && (
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-primary rounded-full" />
                        Campaign Delivery Stats
                    </h2>
                    <StatsPanel stats={stats} />
                </div>
            )}

            <div className="bg-surface border border-border rounded-lg p-6 mb-6">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <FileText size={18} /> Email Body
                </h3>
                <div
                    className="text-text-secondary leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: campaign.body }}
                />
            </div>

            <div className="bg-surface border border-border rounded-lg p-6 mb-6">
                <h3 className="text-base font-semibold mb-4">
                    <Users size={18} className="inline mr-1" /> Recipients (
                    {campaign.recipients?.length || 0})
                </h3>
                {campaign.recipients?.length ? (
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                {['Name', 'Email', 'Status', 'Sent At', 'Opened At'].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left p-3 text-text-muted font-medium text-xs uppercase tracking-wide border-b border-border"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {campaign.recipients.map((r) => (
                                <tr key={r.id} className="hover:bg-surface-hover">
                                    <td className="p-3 border-b border-border">{r.name || '—'}</td>
                                    <td className="p-3 border-b border-border">{r.email}</td>
                                    <td className="p-3 border-b border-border">
                                        <StatusBadge status={r.delivery_status} />
                                    </td>
                                    <td className="p-3 border-b border-border text-text-muted">
                                        {r.sent_at ? new Date(r.sent_at).toLocaleString() : '—'}
                                    </td>
                                    <td className="p-3 border-b border-border text-text-muted">
                                        {r.opened_at ? new Date(r.opened_at).toLocaleString() : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-text-muted">No recipients assigned.</p>
                )}
            </div>

            {/* Schedule Dialog */}
            <ScheduleDialog
                open={showSchedule}
                loading={scheduleMutation.isPending}
                onConfirm={handleSchedule}
                onCancel={() => setShowSchedule(false)}
            />

            {/* Confirm Dialogs */}
            <ConfirmDialog
                open={confirmAction === 'send'}
                title="Send Campaign"
                message="Are you sure you want to send this campaign? This action cannot be undone and emails will be dispatched to all recipients."
                confirmLabel={sendMutation.isPending ? 'Sending...' : 'Send Campaign'}
                variant="success"
                loading={sendMutation.isPending}
                onConfirm={handleSend}
                onCancel={() => setConfirmAction(null)}
            />

            <ConfirmDialog
                open={confirmAction === 'delete'}
                title="Delete Campaign"
                message="Are you sure you want to delete this campaign? This action cannot be undone and all associated data will be permanently removed."
                confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete Campaign'}
                variant="danger"
                loading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setConfirmAction(null)}
            />

        </div>
    );
}
