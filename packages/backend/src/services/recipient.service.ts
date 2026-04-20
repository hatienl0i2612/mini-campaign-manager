import { db } from '@/db/connection';
import { PAGINATION } from '@mini-campaign-manager/shared';
import type { PaginatedResponse, Recipient } from '@mini-campaign-manager/shared';

/**
 * Recipient Service
 * Handles recipient CRUD and bulk operations.
 */
export class RecipientService {
    /**
     * List all recipients with pagination
     */
    static async findAll(
        page: number = PAGINATION.DEFAULT_PAGE,
        limit: number = PAGINATION.DEFAULT_LIMIT,
    ): Promise<PaginatedResponse<Recipient>> {
        const offset = (page - 1) * limit;

        const [[{ count }], rows] = await Promise.all([
            db('recipients').count<{ count: string }[]>('* as count'),
            db('recipients').orderBy('created_at', 'desc').limit(limit).offset(offset),
        ]);

        const total = Number(count);

        return {
            data: rows as Recipient[],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Create a single recipient
     */
    static async create(email: string, name?: string): Promise<Recipient> {
        const existing = await db('recipients').where({ email }).first();
        if (existing) {
            throw Object.assign(new Error('Recipient with this email already exists'), {
                statusCode: 409,
            });
        }

        const [recipient] = await db('recipients')
            .insert({ email, name: name || null })
            .returning('*');

        return recipient as Recipient;
    }

    /**
     * Bulk create recipients (skip duplicates)
     */
    static async bulkCreate(
        recipients: { email: string; name?: string }[],
    ): Promise<{ created: number; skipped: number }> {
        const data = recipients.map((r) => ({
            email: r.email,
            name: r.name || null,
        }));

        const result = await db('recipients')
            .insert(data)
            .onConflict('email')
            .ignore()
            .returning('*');

        return {
            created: result.length,
            skipped: recipients.length - result.length,
        };
    }

    /**
     * Delete a recipient by ID
     */
    static async delete(id: string): Promise<void> {
        const deleted = await db('recipients').where({ id }).del();
        if (deleted === 0) {
            throw Object.assign(new Error('Recipient not found'), { statusCode: 404 });
        }
    }
}
