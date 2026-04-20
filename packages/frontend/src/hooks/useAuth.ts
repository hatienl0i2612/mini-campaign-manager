/**
 * React Query hooks for auth
 */
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAppDispatch } from './useStore';
import { setCredentials } from '@/store/slices/authSlice';
import type { RegisterInput, LoginInput } from '@mini-campaign-manager/shared';

export function useLogin() {
    const dispatch = useAppDispatch();
    return useMutation({
        mutationFn: (data: LoginInput) => authApi.login(data),
        onSuccess: (data) => {
            dispatch(setCredentials(data));
        },
    });
}

export function useRegister() {
    const dispatch = useAppDispatch();
    return useMutation({
        mutationFn: (data: RegisterInput) => authApi.register(data),
        onSuccess: (data) => {
            dispatch(setCredentials(data));
        },
    });
}
