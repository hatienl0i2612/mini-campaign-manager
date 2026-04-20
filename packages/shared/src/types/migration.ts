/**
 * Knex migration table type definitions
 */

export interface Migration {
    id: number;
    name: string | null;
    batch: number | null;
    migration_time: Date | null;
}

export interface MigrationLock {
    index: number;
    is_locked: number | null;
}
