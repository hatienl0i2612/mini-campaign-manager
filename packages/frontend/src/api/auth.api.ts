/**
 * Auth API functions
 */
import apiClient from './client';
import type { AuthResponse, RegisterInput, LoginInput, UserPublic } from '@mini-campaign-manager/shared';

export const authApi = {
    register: (data: RegisterInput) =>
        apiClient.post<AuthResponse>('/auth/register', data).then((res) => res.data),

    login: (data: LoginInput) =>
        apiClient.post<AuthResponse>('/auth/login', data).then((res) => res.data),

    getMe: () =>
        apiClient.get<{ user: UserPublic }>('/auth/me').then((res) => res.data),
};
