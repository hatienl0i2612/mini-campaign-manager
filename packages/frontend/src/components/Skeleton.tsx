/**
 * Reusable skeleton loader components for loading states.
 *
 * @example
 * <PageLoader text="Loading campaigns..." />
 * <CampaignCardSkeleton />
 * <CampaignDetailSkeleton />
 */
import { Spinner } from './Spinner';

/* ─── Base skeleton block with shimmer animation ──────────── */
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`bg-surface-2 rounded animate-pulse ${className}`} />;
}

/* ─── Full page loading spinner ───────────────────────────── */
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="flex items-center justify-center p-16 text-text-muted">
            <Spinner size="lg" />
            <span className="ml-3">{text}</span>
        </div>
    );
}

/* ─── Campaign card skeleton (matches CampaignCard layout) ── */
export function CampaignCardSkeleton() {
    return (
        <div className="bg-surface border border-border rounded-lg p-5 animate-pulse">
            <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64 mb-4" />
            <div className="flex gap-4 pt-3 border-t border-border">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    );
}

/* ─── Campaign detail page skeleton ──────────────────────── */
export function CampaignDetailSkeleton() {
    return (
        <div className="max-w-[900px] animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-7 w-64" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-6">
                <Skeleton className="h-8 w-24 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
            </div>

            {/* Content card */}
            <div className="bg-surface border border-border rounded-xl p-6 mb-6">
                <Skeleton className="h-5 w-40 mb-4" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Stats panel */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-surface border border-border rounded-lg p-4">
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-7 w-12" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export { Skeleton };
