import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Enable UUID extension
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // 1. Tenants Table
    await knex.schema.createTable('tenants', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('name').notNullable();
        table.string('slug').notNullable().unique();
        table.string('domain').unique();
        table.string('logo_url');
        table.string('primary_color');
        table.boolean('is_active').defaultTo(true);
        table.jsonb('settings').defaultTo('{}');
        table.timestamps(true, true);
    });

    // 2. Churches Table
    await knex.schema.createTable('churches', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE').notNullable();
        table.string('name').notNullable();
        table.string('location');
        table.string('contact_phone');
        table.string('contact_email');
        table.string('bishop_name');
        table.string('pastor_name');
        table.text('description');
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
    });

    // 3. Roles Table
    await knex.schema.createTable('roles', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE'); // Null means global role
        table.string('name').notNullable();
        table.string('description');
        table.unique(['tenant_id', 'name']);
        table.timestamps(true, true);
    });

    // 4. Permissions Table
    await knex.schema.createTable('permissions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('name').notNullable().unique();
        table.string('description');
        table.timestamps(true, true);
    });

    // 5. Role Permissions Junction
    await knex.schema.createTable('role_permissions', (table) => {
        table.uuid('role_id').references('id').inTable('roles').onDelete('CASCADE').notNullable();
        table.uuid('permission_id').references('id').inTable('permissions').onDelete('CASCADE').notNullable();
        table.primary(['role_id', 'permission_id']);
    });

    // 6. Users Table (Authentication)
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('tenant_id').references('id').inTable('tenants').onDelete('CASCADE').notNullable();
        table.uuid('church_id').references('id').inTable('churches').onDelete('SET NULL');
        table.string('email').unique();
        table.string('phone_number').notNullable().unique();
        table.string('password_hash').notNullable();
        table.string('full_name').notNullable();
        table.string('avatar_url');
        table.uuid('role_id').references('id').inTable('roles').onDelete('SET NULL');
        table.boolean('is_active').defaultTo(true);
        table.boolean('is_verified').defaultTo(false);
        table.timestamp('email_verified_at');
        table.timestamp('phone_verified_at');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('role_permissions');
    await knex.schema.dropTableIfExists('permissions');
    await knex.schema.dropTableIfExists('roles');
    await knex.schema.dropTableIfExists('churches');
    await knex.schema.dropTableIfExists('tenants');
}
