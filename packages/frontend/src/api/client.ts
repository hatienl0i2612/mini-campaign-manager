import axios from 'axios';
import { toast } from 'sonner';
import { store } from '@/store/index';
import { logout } from '@/store/slices/authSlice';

/**
 * Axios instance pre-configured with base URL and auth interceptors.
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use((config) => {
    const token = store.getState().auth.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401 (token expired)
let isRedirecting = false;

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect on token-expired 401s, NOT on login/register failures
            const url = error.config?.url || '';
            const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

            if (!isAuthRoute && !isRedirecting) {
                isRedirecting = true;
                store.dispatch(logout());
                toast.error('Session expired. Redirecting to login...', { duration: 3000 });

                setTimeout(() => {
                    isRedirecting = false;
                    window.location.href = '/login';
                }, 3000);
            }
        }
        return Promise.reject(error);
    },
);

export default apiClient;
