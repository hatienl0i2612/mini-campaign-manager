import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useRegister } from '@/hooks/useAuth';
import { registerSchema } from '@mini-campaign-manager/shared';
import type { RegisterInput } from '@mini-campaign-manager/shared';
import { AuthLayout } from '@/components/AuthLayout';
import { Spinner } from '@/components/Spinner';

export function RegisterPage() {
    const navigate = useNavigate();
    const registerMutation = useRegister();
    const [form, setForm] = useState<RegisterInput>({ email: '', name: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const result = registerSchema.safeParse(form);
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        try {
            await registerMutation.mutateAsync(form);
            navigate('/campaigns');
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.error
                : 'Registration failed';
            setError(message || 'Registration failed');
        }
    };

    return (
        <AuthLayout>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-text">Create your account</h2>
                <p className="text-sm text-text-muted mt-1">
                    Start your free trial — no credit card required
                </p>
            </div>

            {error && (
                <div className="bg-error-dim text-error px-4 py-3 rounded-lg text-[0.8125rem] mb-5 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="register-name"
                        className="block text-sm text-text-secondary mb-1.5"
                    >
                        Full Name
                    </label>
                    <input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        autoFocus
                    />
                </div>

                <div>
                    <label
                        htmlFor="register-email"
                        className="block text-sm text-text-secondary mb-1.5"
                    >
                        Email
                    </label>
                    <input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                </div>

                <div>
                    <label
                        htmlFor="register-password"
                        className="block text-sm text-text-secondary mb-1.5"
                    >
                        Password
                    </label>
                    <input
                        id="register-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                </div>

                <button
                    id="register-submit"
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full py-3 bg-gradient-to-r from-[#a78bfa] to-primary rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {registerMutation.isPending ? (
                        <Spinner size="md" variant="light" />
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-text-muted text-sm">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-primary font-medium hover:text-primary-hover transition-colors"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
