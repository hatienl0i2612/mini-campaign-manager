import { useEffect, useState } from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, LayoutList, Moon, Sun, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useStore';
import { logout, setUser } from '@/store/slices/authSlice';
import { authApi } from '@/api/auth.api';
import { useTheme } from '@/hooks/useTheme';

export function Layout() {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isVerifying, setIsVerifying] = useState(true);
    const { theme, toggleTheme } = useTheme();

    // Verify token on mount — call /me to check if token is still valid
    useEffect(() => {
        if (!isAuthenticated) {
            setIsVerifying(false);
            return;
        }

        authApi
            .getMe()
            .then((data) => {
                dispatch(setUser(data.user));
            })
            .catch(() => {
                // Token expired or invalid — force logout
                dispatch(logout());
                navigate('/login');
            })
            .finally(() => {
                setIsVerifying(false);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (isVerifying) {
        return (
            <div className="flex items-center justify-center p-16 text-text-muted">
                <div className="w-6 h-6 border-[2.5px] border-border border-t-primary rounded-full animate-spin-fast mr-3" />
                Verifying session...
            </div>
        );
    }

    const handleLogout = () => {
        queryClient.clear();
        dispatch(logout());
        navigate('/login');
    };

    const initials = user?.name
        ? user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : '?';

    return (
        <div className="flex min-h-screen">
            <aside className="w-65 bg-surface border-r border-border p-6 flex flex-col fixed top-0 left-0 bottom-0 z-10">
                <div className="text-lg font-bold text-text pb-6 border-b border-border mb-6 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-[#a78bfa] rounded flex items-center justify-center text-white">
                        <Mail size={16} />
                    </div>
                    <span>Campaign Mgr</span>
                </div>

                <nav className="flex-1 flex flex-col gap-1">
                    <NavLink
                        to="/campaigns"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded text-[0.9375rem] font-medium transition-all duration-150 ${
                                isActive
                                    ? 'bg-primary-dim text-primary-hover'
                                    : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                            }`
                        }
                    >
                        <LayoutList size={16} /> Campaigns
                    </NavLink>
                </nav>

                <div className="pt-4 border-t border-border mt-auto">
                    {/* Theme toggle */}
                    <button
                        id="theme-toggle"
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded text-[0.8125rem] font-medium text-text-secondary hover:bg-surface-hover hover:text-text transition-all duration-150 mb-3"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <span className="relative w-9 h-5 bg-surface-2 rounded-full border border-border transition-colors duration-300">
                            <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-all duration-300 ${
                                    theme === 'dark'
                                        ? 'left-0.5 bg-[#334155]'
                                        : 'left-[18px] bg-[#fbbf24]'
                                }`}
                            >
                                {theme === 'dark' ? <Moon size={10} /> : <Sun size={10} />}
                            </span>
                        </span>
                        <span>{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
                    </button>

                    {/* User info */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[#a78bfa] flex items-center justify-center font-semibold text-sm text-white">
                            {initials}
                        </div>
                        <div>
                            <div className="text-sm font-medium">{user?.name}</div>
                            <div className="text-xs text-text-muted">{user?.email}</div>
                        </div>
                    </div>
                    <button
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded text-[0.8125rem] font-medium bg-surface-2 text-text border border-border hover:bg-surface-hover hover:border-border-hover"
                        onClick={handleLogout}
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-65 p-8 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
