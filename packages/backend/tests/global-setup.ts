import Knex from 'knex';
import 'dotenv/config';

// Deriving URLs from DATABASE_URL
const getBaseUrl = () => process.env.DATABASE_URL || '';

const getAdminUrl = () => {
    try {
        const url = new URL(getBaseUrl());
        url.pathname = '/postgres'; // Connect to default postgres system db
        return url.toString();
    } catch {
        return 'postgres://postgres:postgres@localhost:5433/postgres';
    }
};

const getTestDbName = () => {
    try {
        const url = new URL(getBaseUrl());
        const name = url.pathname.slice(1); // remove leading slash
        return name.endsWith('_test') ? name : `${name}_test`;
    } catch {
        return 'campaign_manager_test';
    }
};

const getTestUrl = () => {
    try {
        const url = new URL(getBaseUrl());
        if (!url.pathname.endsWith('_test')) {
            url.pathname = `${url.pathname}_test`;
        }
        return url.toString();
    } catch {
        return `${getBaseUrl()}_test`;
    }
};

const ADMIN_URL = getAdminUrl();
const TEST_DB = getTestDbName();
const TEST_URL = getTestUrl();

/**
 * Global setup — runs ONCE before all test files.
 * Creates the test database and runs migrations.
 */
export async function setup() {
    // Connect to default 'postgres' db to create/drop test db
    const admin = Knex({ client: 'pg', connection: ADMIN_URL });

    try {
        // Drop if exists, then create fresh
        await admin.raw(`DROP DATABASE IF EXISTS ${TEST_DB}`);
        await admin.raw(`CREATE DATABASE ${TEST_DB}`);
        console.log(`\n✅ Test database "${TEST_DB}" created`);
    } finally {
        await admin.destroy();
    }

    // Run migrations on the test database
    const testDb = Knex({ client: 'pg', connection: TEST_URL });

    try {
        await testDb.migrate.latest({
            directory: './src/db/migrations',
            loadExtensions: ['.ts'],
        });
        console.log('✅ Migrations applied to test database\n');
    } finally {
        await testDb.destroy();
    }
}

/**
 * Global teardown — runs ONCE after all test files.
 * Drops the test database.
 */
export async function teardown() {
    const admin = Knex({ client: 'pg', connection: ADMIN_URL });

    try {
        // Force-disconnect all connections first
        await admin.raw(`
            SELECT pg_terminate_backend(pid) 
            FROM pg_stat_activity 
            WHERE datname = '${TEST_DB}' AND pid <> pg_backend_pid()
        `);
        await admin.raw(`DROP DATABASE IF EXISTS ${TEST_DB}`);
        console.log(`\n🧹 Test database "${TEST_DB}" dropped`);
    } finally {
        await admin.destroy();
    }
}
