import { z } from 'zod';

/**
 * Campaign validation schemas (Zod)
 */

export const createCampaignSchema = z.object({
    name: z.string().min(1, 'Campaign name is required').max(255),
    subject: z.string().min(1, 'Subject is required').max(500),
    body: z.string().min(1, 'Body is required'),
    recipientIds: z.array(z.string().uuid()).optional(),
});

export const updateCampaignSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    subject: z.string().min(1).max(500).optional(),
    body: z.string().min(1).optional(),
    recipientIds: z.array(z.string().uuid()).optional(),
});

export const scheduleCampaignSchema = z.object({
    scheduled_at: z
        .string()
        .refine((val) => new Date(val) > new Date(), 'Scheduled date must be in the future'),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type ScheduleCampaignInput = z.infer<typeof scheduleCampaignSchema>;
