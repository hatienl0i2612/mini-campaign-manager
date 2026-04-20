import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

function getInitialTheme(): Theme {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;

    // Fall back to system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';

    return 'dark';
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'light') {
        root.classList.add('light');
    } else {
        root.classList.remove('light');
    }
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    // Apply on mount & when theme changes
    useEffect(() => {
        applyTheme(theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    // Listen for system preference changes
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: light)');
        const handler = (e: MediaQueryListEvent) => {
            // Only auto-switch if the user hasn't manually set a preference
            if (!localStorage.getItem(STORAGE_KEY)) {
                setThemeState(e.matches ? 'light' : 'dark');
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }, []);

    return { theme, toggleTheme } as const;
}
