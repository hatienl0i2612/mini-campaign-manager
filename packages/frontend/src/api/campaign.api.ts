/**
 * Campaign API functions
 */
import apiClient from './client';
import type {
    CampaignWithStats,
    CampaignDetail,
    CampaignStats,
    PaginatedResponse,
    CreateCampaignInput,
    UpdateCampaignInput,
    ScheduleCampaignInput,
} from '@mini-campaign-manager/shared';

export const campaignApi = {
    list: (params?: { page?: number; limit?: number; status?: string }) =>
        apiClient
            .get<PaginatedResponse<CampaignWithStats>>('/campaigns', { params })
            .then((res) => res.data),

    getById: (id: string) =>
        apiClient.get<CampaignDetail>(`/campaigns/${id}`).then((res) => res.data),

    getStats: (id: string) =>
        apiClient.get<CampaignStats>(`/campaigns/${id}/stats`).then((res) => res.data),

    create: (data: CreateCampaignInput) =>
        apiClient.post('/campaigns', data).then((res) => res.data),

    update: (id: string, data: UpdateCampaignInput) =>
        apiClient.put(`/campaigns/${id}`, data).then((res) => res.data),

    delete: (id: string) => apiClient.delete(`/campaigns/${id}`).then((res) => res.data),

    schedule: (id: string, data: ScheduleCampaignInput) =>
        apiClient.post(`/campaigns/${id}/schedule`, data).then((res) => res.data),

    send: (id: string) => apiClient.post(`/campaigns/${id}/send`).then((res) => res.data),
};
