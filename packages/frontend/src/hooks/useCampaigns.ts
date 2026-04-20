/**
 * React Query hooks for campaigns
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/api/campaign.api';
import type {
    CreateCampaignInput,
    UpdateCampaignInput,
    ScheduleCampaignInput,
} from '@mini-campaign-manager/shared';

export function useCampaigns(params?: { page?: number; limit?: number; status?: string }) {
    return useQuery({
        queryKey: ['campaigns', params],
        queryFn: () => campaignApi.list(params),
    });
}

export function useCampaign(id: string) {
    return useQuery({
        queryKey: ['campaign', id],
        queryFn: () => campaignApi.getById(id),
        enabled: !!id,
        staleTime: 0,
    });
}

export function useCampaignStats(id: string) {
    return useQuery({
        queryKey: ['campaign', id, 'stats'],
        queryFn: () => campaignApi.getStats(id),
        enabled: !!id,
        staleTime: 0,
    });
}

export function useCreateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCampaignInput) => campaignApi.create(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
    });
}

export function useUpdateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCampaignInput }) =>
            campaignApi.update(id, data),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['campaign', id] });
        },
    });
}

export function useDeleteCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => campaignApi.delete(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['campaign', id] });
        },
    });
}

export function useScheduleCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ScheduleCampaignInput }) =>
            campaignApi.schedule(id, data),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['campaign', id] });
        },
    });
}

export function useSendCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => campaignApi.send(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['campaign', id] });
            queryClient.invalidateQueries({ queryKey: ['campaign', id, 'stats'] });
        },
    });
}
