/**
 * Recipient-related type definitions
 */

export interface Recipient {
    id: string;
    email: string;
    name: string | null;
    created_at: Date;
}
