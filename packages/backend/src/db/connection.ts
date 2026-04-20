import Knex from 'knex';
import { env } from '@/config/env';
import '@/db/types';

/**
 * Knex database instance
 */
export const db = Knex({
    client: 'pg',
    connection: env.DATABASE_URL,
});
