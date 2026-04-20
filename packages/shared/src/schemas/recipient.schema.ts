import { z } from 'zod';

/**
 * Recipient validation schemas (Zod)
 */

export const createRecipientSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().max(255).optional(),
});

export const createRecipientBulkSchema = z.object({
    recipients: z.array(createRecipientSchema).min(1, 'At least one recipient is required'),
});

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;
export type CreateRecipientBulkInput = z.infer<typeof createRecipientBulkSchema>;
