import { useState, useEffect, useRef } from 'react';
import { CalendarPlus } from 'lucide-react';

interface ScheduleDialogProps {
    open: boolean;
    loading?: boolean;
    onConfirm: (date: Date) => void;
    onCancel: () => void;
}

/**
 * Get the local datetime string in YYYY-MM-DDTHH:mm format
 * for use with <input type="datetime-local">
 */
function toLocalDatetimeString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ScheduleDialog({
    open,
    loading = false,
    onConfirm,
    onCancel,
}: ScheduleDialogProps) {
    const [isVisible, setIsVisible] = useState(open);
    const [isClosing, setIsClosing] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Default to 1 hour from now, rounded to next 15 min
    const getDefaultDate = () => {
        const d = new Date(Date.now() + 60 * 60 * 1000);
        d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
        return toLocalDatetimeString(d);
    };

    const [dateValue, setDateValue] = useState(getDefaultDate);
    const [error, setError] = useState('');

    // Sync visibility and reset state when open prop changes
    useEffect(() => {
        if (open) {
            setIsVisible(true);
            setIsClosing(false);
            setDateValue(getDefaultDate());
            setError('');
        } else if (isVisible) {
            setIsClosing(true);
        }
    }, [open, isVisible]);

    // Native dialog control
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isVisible && !dialog.open) {
            dialog.showModal();
        }
    }, [isVisible]);

    const handleAnimationEnd = () => {
        if (isClosing) {
            setIsClosing(false);
            setIsVisible(false);
            dialogRef.current?.close();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current && !loading && !isClosing) {
            onCancel();
        }
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open && !loading && !isClosing) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onCancel, loading, isClosing]);

    const handleConfirm = () => {
        const parsed = new Date(dateValue);
        if (isNaN(parsed.getTime())) {
            setError('Please select a valid date and time.');
            return;
        }
        if (parsed <= new Date()) {
            setError('Schedule date must be in the future.');
            return;
        }
        setError('');
        onConfirm(parsed);
    };

    // Minimum datetime = now (can't schedule in the past)
    const minDatetime = toLocalDatetimeString(new Date());

    if (!isVisible) return null;

    return (
        <dialog
            ref={dialogRef}
            onClick={handleBackdropClick}
            onAnimationEnd={handleAnimationEnd}
            className={`fixed inset-0 z-50 m-auto w-full max-w-sm rounded-xl border border-border bg-surface p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm 
                ${isClosing ? 'animate-fade-out backdrop-fade-out' : 'animate-fade-in backdrop-fade-in'}`}
        >
            <div className="p-6">
                {/* Header */}
                <h3 className="text-lg font-semibold text-text mb-1 flex items-center gap-2">
                    <CalendarPlus size={20} /> Schedule Campaign
                </h3>
                <p className="text-sm text-text-secondary mb-5">
                    Choose when this campaign should be sent.
                </p>

                {/* Date & Time Picker */}
                <div className="mb-2">
                    <label
                        htmlFor="schedule-datetime"
                        className="block text-[0.8125rem] font-medium text-text-secondary mb-1.5"
                    >
                        Date & Time
                    </label>
                    <input
                        id="schedule-datetime"
                        type="datetime-local"
                        value={dateValue}
                        min={minDatetime}
                        onChange={(e) => {
                            setDateValue(e.target.value);
                            setError('');
                        }}
                        className="w-full bg-surface-2 text-text border border-border rounded-lg px-3 py-2.5 text-sm
                            focus:border-primary focus:ring-3 focus:ring-primary-dim outline-none transition-all duration-150"
                    />
                </div>

                {/* Error */}
                {error && <p className="text-error text-xs mt-1 mb-3">{error}</p>}

                {/* Preview */}
                {dateValue && !error && (
                    <div className="mt-3 mb-5 px-3 py-2 bg-primary-dim rounded-lg text-sm text-primary-hover">
                        🕐 Will be sent on{' '}
                        <strong>
                            {new Date(dateValue).toLocaleString(undefined, {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </strong>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading || isClosing}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-surface-2 text-text border border-border hover:bg-surface-hover hover:border-border-hover transition-all duration-150 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || isClosing}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-fast mr-2" />
                        )}
                        {loading ? 'Scheduling...' : 'Schedule'}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
