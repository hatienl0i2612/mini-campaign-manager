/**
 * Reusable spinner component for inline and button loading states.
 *
 * @example
 * <Spinner />                    — default (md, theme-aware)
 * <Spinner size="sm" />          — small, for buttons
 * <Spinner size="lg" />          — large, for page-level loading
 * <Spinner variant="light" />    — white spinner for colored buttons
 */

const sizeMap = {
    xs: 'w-3.5 h-3.5 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-[2.5px]',
} as const;

const variantMap = {
    default: 'border-border border-t-primary',
    light: 'border-white/30 border-t-white',
} as const;

interface SpinnerProps {
    size?: keyof typeof sizeMap;
    variant?: keyof typeof variantMap;
    className?: string;
}

export function Spinner({ size = 'md', variant = 'default', className = '' }: SpinnerProps) {
    return (
        <div
            className={`rounded-full animate-spin-fast ${sizeMap[size]} ${variantMap[variant]} ${className}`}
            role="status"
            aria-label="Loading"
        />
    );
}
