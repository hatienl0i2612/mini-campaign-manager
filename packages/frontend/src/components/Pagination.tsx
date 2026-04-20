import { useMemo } from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    /** How many pages to show around the current page (default: 1) */
    siblingCount?: number;
}

/**
 * Builds the list of page numbers + ellipsis markers.
 */
function buildPageRange(current: number, total: number, siblings: number): (number | '…')[] {
    // Always show first `boundary` and last `boundary` pages
    const boundary = 3;

    // If total pages is small enough, show all
    if (total <= boundary * 2 + siblings * 2 + 3) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftBoundary = Array.from({ length: boundary }, (_, i) => i + 1);
    const rightBoundary = Array.from({ length: boundary }, (_, i) => total - boundary + 1 + i);

    // Pages around current
    const siblingStart = Math.max(current - siblings, 1);
    const siblingEnd = Math.min(current + siblings, total);
    const middlePages: number[] = [];
    for (let i = siblingStart; i <= siblingEnd; i++) {
        middlePages.push(i);
    }

    // Merge and deduplicate, maintaining order
    const allPages = new Set([...leftBoundary, ...middlePages, ...rightBoundary]);
    const sorted = Array.from(allPages).sort((a, b) => a - b);

    // Insert ellipsis where gaps exist
    const result: (number | '…')[] = [];
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
            result.push('…');
        }
        result.push(sorted[i]);
    }

    return result;
}

const btnBase =
    'inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-lg text-[0.8125rem] font-medium transition-all duration-150 cursor-pointer';
const btnInactive = 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text';
const btnActive = 'bg-primary-dim text-primary-hover';
const btnNav =
    'bg-surface-2 text-text border border-border hover:bg-surface-hover hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-2';

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
}: PaginationProps) {
    const pages = useMemo(
        () => buildPageRange(currentPage, totalPages, siblingCount),
        [currentPage, totalPages, siblingCount],
    );

    if (totalPages <= 1) return null;

    return (
        <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
            {/* Previous */}
            <button
                className={`${btnBase} ${btnNav} mr-1`}
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                aria-label="Previous page"
            >
                ‹
            </button>

            {/* Page numbers */}
            {pages.map((item, idx) =>
                item === '…' ? (
                    <span
                        key={`ellipsis-${idx}`}
                        className="inline-flex items-center justify-center min-w-9 h-9 text-text-muted text-sm select-none"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        className={`${btnBase} ${item === currentPage ? btnActive : btnInactive}`}
                        onClick={() => onPageChange(item)}
                        aria-current={item === currentPage ? 'page' : undefined}
                    >
                        {item}
                    </button>
                ),
            )}

            {/* Next */}
            <button
                className={`${btnBase} ${btnNav} ml-1`}
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                aria-label="Next page"
            >
                ›
            </button>
        </nav>
    );
}
