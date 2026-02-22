import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // 1. Extend Tenants table for Enterprise features
    await knex.schema.alterTable('tenants', (table) => {
        table.decimal('commission_rate', 5, 2).defaultTo(0.00); // For Fintech revenue sharing
        table.integer('sms_balance').defaultTo(0);
        table.boolean('is_locked').defaultTo(false); // For suspension
        table.string('sender_id'); // Custom SMS Sender ID
    });

    // 2. Extend Churches table for Hierarchy (Branches)
    await knex.schema.alterTable('churches', (table) => {
        table.uuid('parent_id').references('id').inTable('churches').onDelete('SET NULL');
        table.string('type').defaultTo('HQ'); // HQ, BRANCH
    });

    // 3. Extend Users table for Super Admin
    await knex.schema.alterTable('users', (table) => {
        table.boolean('is_super_admin').defaultTo(false);
    });

    // 4. Audit Logs Table
    await knex.schema.createTable('audit_logs', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE');
        table.uuid('user_id').references('id').inTable('users').onDelete('SET NULL');
        table.string('action').notNullable(); // e.g., 'LOGIN', 'CREATE_MEMBER', 'SUSPEND_TENANT'
        table.string('entity_type'); // e.g., 'MEMBER', 'CHURCH', 'TRANSACTION'
        table.uuid('entity_id');
        table.jsonb('old_values');
        table.jsonb('new_values');
        table.string('ip_address');
        table.text('user_agent');
        table.timestamps(true, true);
    });

    // 5. USSD Sessions Table (Fintech Stubs)
    await knex.schema.createTable('ussd_sessions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('session_id').unique().notNullable();
        table.string('phone_number').notNullable();
        table.string('service_code');
        table.string('current_menu');
        table.jsonb('context_data').defaultTo('{}');
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('ussd_sessions');
    await knex.schema.dropTableIfExists('audit_logs');

    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('is_super_admin');
    });

    await knex.schema.alterTable('churches', (table) => {
        table.dropColumn('parent_id');
        table.dropColumn('type');
    });

    await knex.schema.alterTable('tenants', (table) => {
        table.dropColumn('commission_rate');
        table.dropColumn('sms_balance');
        table.dropColumn('is_locked');
        table.dropColumn('sender_id');
    });
}
