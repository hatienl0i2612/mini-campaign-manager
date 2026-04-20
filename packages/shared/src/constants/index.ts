/**
 * Shared constants and enums
 */

export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'sent'] as const;

export const RECIPIENT_STATUSES = ['pending', 'sent', 'failed'] as const;

/** HTTP status codes used across the app */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

/** Pagination defaults */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

/** API route prefixes */
export const API_ROUTES = {
    AUTH: '/api/auth',
    CAMPAIGNS: '/api/campaigns',
    RECIPIENTS: '/api/recipients',
} as const;
