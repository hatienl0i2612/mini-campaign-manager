/**
 * Database migration runner using Knex built-in migrations
 *
 * Usage:
 *   npm run db:migrate              — Run pending migrations
 *   npm run db:migrate -- --down    — Rollback the last migration
 */
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './connection';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationConfig = {
    directory: path.join(__dirname, 'migrations'),
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
};

async function migrate() {
    try {
        await db.raw('SELECT 1+1 AS result');
        console.log('✅ Database connected');

        const [batch, migrations] = await db.migrate.latest(migrationConfig);

        if (migrations.length === 0) {
            console.log('✅ No pending migrations');
        } else {
            console.log(`📦 Batch ${batch}: ran ${migrations.length} migration(s)`);
            migrations.forEach((m: string) => console.log(`   ✅ ${path.basename(m)}`));
        }
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

async function rollback() {
    try {
        await db.raw('SELECT 1+1 AS result');
        console.log('✅ Database connected');

        const [batch, migrations] = await db.migrate.rollback(migrationConfig);

        if (migrations.length === 0) {
            console.log('⚠️  No migrations to rollback');
        } else {
            console.log(`⏪ Batch ${batch}: rolled back ${migrations.length} migration(s)`);
            migrations.forEach((m: string) => console.log(`   ↩️  ${path.basename(m)}`));
        }
    } catch (error) {
        console.error('❌ Rollback failed:', error);
        process.exit(1);
    } finally {
        await db.destroy();
    }
}

// ─── CLI entry point ──────────────────────────────────────────────
if (process.argv.includes('--down')) {
    rollback();
} else {
    migrate();
}
