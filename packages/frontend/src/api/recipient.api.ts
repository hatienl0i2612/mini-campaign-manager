/**
 * Recipient API functions
 */
import apiClient from './client';
import type {
    Recipient,
    PaginatedResponse,
    CreateRecipientInput,
} from '@mini-campaign-manager/shared';

export const recipientApi = {
    list: (params?: { page?: number; limit?: number }) =>
        apiClient
            .get<PaginatedResponse<Recipient>>('/recipients', { params })
            .then((res) => res.data),

    create: (data: CreateRecipientInput) =>
        apiClient.post<Recipient>('/recipients', data).then((res) => res.data),

    bulkCreate: (recipients: CreateRecipientInput[]) =>
        apiClient.post('/recipients/bulk', { recipients }).then((res) => res.data),

    delete: (id: string) => apiClient.delete(`/recipients/${id}`).then((res) => res.data),
};
