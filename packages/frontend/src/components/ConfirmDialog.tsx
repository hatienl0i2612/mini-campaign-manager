import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/Spinner';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'success' | 'primary';
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const variantStyles: Record<string, string> = {
    danger: 'bg-error hover:bg-red-600 text-white',
    success: 'bg-success hover:bg-green-600 text-white',
    primary: 'bg-primary hover:bg-primary-hover text-white',
};

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'primary',
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [isVisible, setIsVisible] = useState(open);
    const [isClosing, setIsClosing] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Sync visibility with open prop
    useEffect(() => {
        if (open) {
            setIsVisible(true);
            setIsClosing(false);
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

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current && !loading && !isClosing) {
            onCancel();
        }
    };

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open && !loading && !isClosing) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open, onCancel, loading, isClosing]);

    if (!isVisible) return null;

    return (
        <dialog
            ref={dialogRef}
            onClick={handleBackdropClick}
            onAnimationEnd={handleAnimationEnd}
            className={`fixed inset-0 z-50 m-auto w-full max-w-md rounded-xl border border-border bg-surface p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm 
                ${isClosing ? 'animate-fade-out backdrop-fade-out' : 'animate-fade-in backdrop-fade-in'}`}
        >
            <div className="p-6">
                {/* Header */}
                <div className="mb-1">
                    <h3 className="text-lg font-semibold text-text">{title}</h3>
                </div>

                {/* Body */}
                <p className="text-sm text-text-secondary leading-relaxed mb-6">{message}</p>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading || isClosing}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-surface-2 text-text border border-border hover:bg-surface-hover hover:border-border-hover transition-all duration-150 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading || isClosing}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]}`}
                    >
                        {loading && (
                            <Spinner size="sm" variant="light" className="mr-2" />
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}
