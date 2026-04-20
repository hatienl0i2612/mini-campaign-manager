import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { CampaignForm } from '@/components/CampaignForm';

export function CampaignNewPage() {
    const navigate = useNavigate();
    const createMutation = useCreateCampaign();

    const handleSubmit = async (data: {
        name: string;
        subject: string;
        body: string;
        recipientIds: string[];
    }) => {
        const campaign = await createMutation.mutateAsync(data);
        toast.success('Campaign created successfully!');
        navigate(`/campaigns/${campaign.id}`);
    };

    return (
        <div className="max-w-[750px]">
            <Link
                to="/campaigns"
                className="inline-flex items-center gap-1.5 text-text-secondary text-sm mb-6 hover:text-text transition-colors"
            >
                ← Back to Campaigns
            </Link>

            <CampaignForm
                title="Create New Campaign"
                submitLabel="Create Campaign"
                isLoading={createMutation.isPending}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/campaigns')}
            />
        </div>
    );
}
