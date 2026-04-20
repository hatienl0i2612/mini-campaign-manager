import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useLogin } from '@/hooks/useAuth';
import { loginSchema } from '@mini-campaign-manager/shared';
import type { LoginInput } from '@mini-campaign-manager/shared';
import { AuthLayout } from '@/components/AuthLayout';
import { Spinner } from '@/components/Spinner';

export function LoginPage() {
    const navigate = useNavigate();
    const loginMutation = useLogin();
    const [form, setForm] = useState<LoginInput>({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const result = loginSchema.safeParse(form);
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        try {
            await loginMutation.mutateAsync(form);
            navigate('/campaigns');
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) ? err.response?.data?.error : 'Login failed';
            setError(message || 'Login failed');
        }
    };

    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-text">Welcome back</h2>
                <p className="text-sm text-text-muted mt-1">Sign in to your account to continue</p>
            </div>

            {error && (
                <div className="bg-error-dim text-error px-4 py-3 rounded-lg text-[0.8125rem] mb-5 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="login-email"
                        className="block text-sm text-text-secondary mb-1.5"
                    >
                        Email
                    </label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        autoFocus
                    />
                </div>

                <div>
                    <label
                        htmlFor="login-password"
                        className="block text-sm text-text-secondary mb-1.5"
                    >
                        Password
                    </label>
                    <input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                </div>

                <button
                    id="login-submit"
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full py-3 bg-gradient-to-r from-primary to-primary-hover rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loginMutation.isPending ? (
                        <Spinner size="md" variant="light" />
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-text-muted text-sm">
                    Don&apos;t have an account?{' '}
                    <Link
                        to="/register"
                        className="text-primary font-medium hover:text-primary-hover transition-colors"
                    >
                        Create one
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
