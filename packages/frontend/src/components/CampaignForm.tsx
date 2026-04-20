import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recipientApi } from '@/api/recipient.api';
import { createCampaignSchema } from '@mini-campaign-manager/shared';
import { X, Save, Users } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

interface CampaignFormProps {
    initialData?: {
        name: string;
        subject: string;
        body: string;
        recipientIds: string[];
    };
    onSubmit: (data: { name: string; subject: string; body: string; recipientIds: string[] }) => Promise<void>;
    isLoading: boolean;
    title: string;
    submitLabel: string;
    onCancel: () => void;
}

export function CampaignForm({
    initialData,
    onSubmit,
    isLoading,
    title,
    submitLabel,
    onCancel,
}: CampaignFormProps) {
    const [form, setForm] = useState({
        name: initialData?.name || '',
        subject: initialData?.subject || '',
        body: initialData?.body || '',
    });
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>(
        initialData?.recipientIds || [],
    );
    const [error, setError] = useState('');

    const { data: recipientData } = useQuery({
        queryKey: ['recipients', { page: 1, limit: 100 }],
        queryFn: () => recipientApi.list({ page: 1, limit: 100 }),
    });

    const toggleRecipient = (id: string) => {
        setSelectedRecipients((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
        );
    };

    const selectAll = () => {
        if (recipientData) {
            setSelectedRecipients(recipientData.data.map((r) => r.id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const payload = { ...form, recipientIds: selectedRecipients };
        const result = createCampaignSchema.safeParse(payload);

        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        try {
            await onSubmit(payload);
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Operation failed';
            setError(msg);
        }
    };

    const labelCls = 'block text-[0.8125rem] font-medium text-text-secondary mb-1.5 uppercase tracking-wider';
    const inputCls = 'w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all';
    const btnSecCls = 'inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded text-[0.8125rem] font-medium bg-surface-2 text-text border border-border hover:bg-surface-hover hover:border-border-hover transition-colors';
    const btnPriCls = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded text-sm font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all';

    return (
        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-6 py-4 border-b border-border bg-surface-2 flex justify-between items-center">
                <h3 className="font-semibold text-lg">{title}</h3>
                <button 
                    onClick={onCancel}
                    className="p-1.5 rounded-full hover:bg-surface-hover text-text-muted transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                {error && (
                    <div className="bg-error-dim text-error px-4 py-3 rounded-lg text-sm mb-6 border border-error/20 flex items-center gap-2 animate-shake">
                        <span className="w-1.5 h-1.5 bg-error rounded-full" />
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className={labelCls}>Campaign Name</label>
                        <input
                            id="name"
                            type="text"
                            className={inputCls}
                            placeholder="e.g. Summer Newsletter 2024"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="subject" className={labelCls}>Email Subject</label>
                        <input
                            id="subject"
                            type="text"
                            className={inputCls}
                            placeholder="e.g. 🎁 Special gift just for you!"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="body" className={labelCls}>Email Body (HTML)</label>
                        <textarea
                            id="body"
                            className={`${inputCls} min-h-[200px] font-mono leading-relaxed`}
                            placeholder="<h1>Hello!</h1><p>Check out our latest deals...</p>"
                            value={form.body}
                            onChange={(e) => setForm({ ...form, body: e.target.value })}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className={labelCls}>
                                <Users size={14} className="inline mr-1.5" />
                                Recipients ({selectedRecipients.length} selected)
                            </label>
                            <button
                                type="button"
                                className="text-[0.8125rem] text-primary hover:underline font-medium"
                                onClick={selectAll}
                            >
                                Select All
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 p-4 bg-surface-2 border border-border rounded-lg min-h-[100px]">
                            {recipientData?.data.map((r) => (
                                <div
                                    key={r.id}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.8125rem] cursor-pointer transition-all duration-200 border ${
                                        selectedRecipients.includes(r.id)
                                            ? 'bg-primary text-white border-primary shadow-sm'
                                            : 'bg-surface border-border text-text-secondary hover:border-primary/50'
                                    }`}
                                    onClick={() => toggleRecipient(r.id)}
                                >
                                    {r.name || r.email}
                                </div>
                            ))}
                            {!recipientData?.data.length && (
                                <p className="text-text-muted text-sm italic w-full text-center py-4">
                                    No recipients available.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-border">
                    <button type="button" className={btnSecCls} onClick={onCancel}>
                        Cancel
                    </button>
                    <button className={btnPriCls} type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <Spinner size="sm" variant="light" />
                        ) : (
                            <Save size={16} />
                        )}
                        {submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}
