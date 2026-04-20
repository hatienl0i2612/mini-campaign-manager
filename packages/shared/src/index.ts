/**
 * @mini-campaign-manager/shared
 *
 * Shared types, interfaces, schemas, and constants
 * used by both backend and frontend packages.
 */

// ─── Types & Interfaces ─────────────────────────────────────────
export * from './types/user';
export * from './types/campaign';
export * from './types/recipient';
export * from './types/paginate';
export * from './types/job-queue';
export * from './types/migration';

// ─── Zod Schemas ─────────────────────────────────────────────────
export * from './schemas/auth.schema';
export * from './schemas/campaign.schema';
export * from './schemas/recipient.schema';

// ─── Constants & Enums ───────────────────────────────────────────
export * from './constants/index';
