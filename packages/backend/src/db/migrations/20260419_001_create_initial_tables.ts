import type { Knex } from 'knex';

/**
 * Migration: Create initial tables
 * - users
 * - campaigns
 * - recipients
 * - campaign_recipients
 */
export async function up(knex: Knex) {
    // 1. Create users table
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('email', 255).notNullable().unique();
        table.string('name', 255).notNullable();
        table.string('password_hash', 255).notNullable();
        table.timestamps(true, true); // created_at, updated_at
    });

    // 2. Create campaigns table
    await knex.schema.createTable('campaigns', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name', 255).notNullable();
        table.string('subject', 500).notNullable();
        table.text('body').notNullable();
        table.enum('status', ['draft', 'scheduled', 'sent']).notNullable().defaultTo('draft');
        table.timestamp('scheduled_at').nullable();
        table
            .uuid('created_by')
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('CASCADE');
        table.timestamps(true, true);
    });

    // 3. Create recipients table
    await knex.schema.createTable('recipients', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('email', 255).notNullable().unique();
        table.string('name', 255).nullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });

    // 4. Create campaign_recipients junction table
    await knex.schema.createTable('campaign_recipients', (table) => {
        table
            .uuid('campaign_id')
            .notNullable()
            .references('id')
            .inTable('campaigns')
            .onDelete('CASCADE');
        table
            .uuid('recipient_id')
            .notNullable()
            .references('id')
            .inTable('recipients')
            .onDelete('CASCADE');
        table.enum('status', ['pending', 'sent', 'failed']).notNullable().defaultTo('pending');
        table.timestamp('sent_at').nullable();
        table.timestamp('opened_at').nullable();
        table.primary(['campaign_id', 'recipient_id']);
    });
}

export async function down(knex: Knex) {
    await knex.schema.dropTableIfExists('campaign_recipients');
    await knex.schema.dropTableIfExists('recipients');
    await knex.schema.dropTableIfExists('campaigns');
    await knex.schema.dropTableIfExists('users');
}
