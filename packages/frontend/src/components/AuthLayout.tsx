import type { ReactNode } from 'react';
import {
    Zap,
    Target,
    BarChart3,
    ShieldCheck,
    Headphones,
    Globe,
    Mail,
    Moon,
    Sun,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import AIBackground from './AIBackground';

interface AuthLayoutProps {
    children: ReactNode;
}

const features = [
    {
        icon: <Zap size={20} />,
        title: 'Lightning-Fast Delivery',
        description: 'Send millions of emails in minutes with our distributed delivery engine.',
    },
    {
        icon: <Target size={20} />,
        title: 'Smart Campaigns',
        description: 'Schedule, segment, and automate campaigns with precision targeting.',
    },
    {
        icon: <BarChart3 size={20} />,
        title: 'Real-Time Analytics',
        description: 'Track opens, clicks, and conversions the moment they happen.',
    },
    {
        icon: <ShieldCheck size={20} />,
        title: 'Enterprise Security',
        description: 'End-to-end encryption with SOC 2 compliance and role-based access.',
    },
];

const stats = [
    { value: '10M+', label: 'Emails Delivered' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '2.4x', label: 'Higher Open Rate' },
    { value: '24/7', label: 'Support' },
];

export function AuthLayout({ children }: AuthLayoutProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute inset-0 bg-bg" />
            <div className="absolute top-0 left-[20%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-primary" />
            <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] rounded-full blur-[150px] opacity-15 bg-[#a78bfa]" />
            <AIBackground />

            {/* ─── Left Panel: Project Info (hidden on mobile) ──────── */}
            <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative flex-col justify-between p-12 xl:p-16">
                {/* Logo + Hero */}
                <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-11 h-11 bg-gradient-to-br from-primary to-[#a78bfa] rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 text-white">
                            <Mail size={22} />
                        </div>
                        <span className="text-xl font-bold text-text">CampaignPro</span>
                    </div>

                    <div className="max-w-xl">
                        <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
                            <span className="text-text">The Smartest Way to</span>
                            <br />
                            <span className="bg-gradient-to-r from-primary via-[#a78bfa] to-primary-hover bg-clip-text text-transparent">
                                Manage Your Campaigns
                            </span>
                        </h1>
                        <p className="text-lg text-text-muted leading-relaxed max-w-lg">
                            CampaignPro empowers marketing teams with AI-driven insights, real-time
                            analytics, and seamless automation — turning every campaign into a
                            conversion machine.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 mt-12">
                        {stats.map((stat) => (
                            <div key={stat.label}>
                                <div className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-primary to-[#a78bfa] bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-2 gap-4 mt-12 animate-fade-in">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group p-5 rounded-2xl bg-text/[0.03] border border-text/[0.06] hover:bg-text/[0.06] hover:border-text/[0.12] transition-all duration-300"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-[#a78bfa]/20 mb-3 group-hover:from-primary/30 group-hover:to-[#a78bfa]/30 transition-all text-primary">
                                {feature.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-text mb-1.5">
                                {feature.title}
                            </h3>
                            <p className="text-xs text-text-muted leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 mt-10">
                    <div className="flex items-center gap-2 text-text-muted">
                        <ShieldCheck size={14} />
                        <span className="text-xs">SOC 2 Certified</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                        <Headphones size={14} />
                        <span className="text-xs">24/7 Priority Support</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                        <Globe size={14} />
                        <span className="text-xs">Global Infrastructure</span>
                    </div>
                </div>
            </div>

            {/* ─── Right Panel: Form ───────────────────────────────── */}
            <div className="w-full lg:w-[45%] xl:w-[40%] relative flex items-center justify-center p-6 sm:p-8 lg:p-12">
                {/* Vertical divider */}
                <div className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-text/10 to-transparent" />

                {/* Theme toggle */}
                <button
                    id="auth-theme-toggle"
                    onClick={toggleTheme}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-lg hover:bg-surface-hover transition-all duration-200"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </button>

                <div className="w-full max-w-sm animate-fade-in">
                    {/* Mobile-only logo */}
                    <div className="text-center mb-8 lg:hidden">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[#a78bfa] mb-4 shadow-lg shadow-primary/30 text-white">
                            <Mail size={28} />
                        </div>
                        <h1 className="text-2xl font-bold text-text">CampaignPro</h1>
                        <p className="text-text-muted mt-1 text-sm">
                            Campaign management, simplified
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/5">
                        {children}
                    </div>

                    {/* Mobile-only features */}
                    <div className="mt-8 space-y-3 lg:hidden">
                        <div className="flex items-center gap-3 text-text-muted">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                <Zap size={16} />
                            </div>
                            <span className="text-sm">Send millions of emails instantly</span>
                        </div>
                        <div className="flex items-center gap-3 text-text-muted">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                <BarChart3 size={16} />
                            </div>
                            <span className="text-sm">Real-time campaign analytics</span>
                        </div>
                        <div className="flex items-center gap-3 text-text-muted">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                <Target size={16} />
                            </div>
                            <span className="text-sm">Smart audience segmentation</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
