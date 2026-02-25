import { Knex } from 'knex';
import argon2 from 'argon2';

export async function seed(knex: Knex): Promise<void> {
    // 1. Create a Platform/System Tenant if it doesn't exist
    let platformTenant = await knex('tenants').where({ slug: 'system' }).first();
    if (!platformTenant) {
        [platformTenant] = await knex('tenants').insert({
            name: 'M-KANISA Platform',
            slug: 'system',
            is_active: true
        }).returning('*');
    }

    // 2. Create Super Admin User
    const existingAdmin = await knex('users').where({ email: 'admin@mkanisa.com' }).first();
    if (!existingAdmin) {
        // Password: Password@123
        const passwordHash = await argon2.hash('Password@123');
        await knex('users').insert({
            tenant_id: platformTenant.id,
            full_name: 'Platform Administrator',
            email: 'admin@mkanisa.com',
            phone_number: '255000000000',
            password_hash: passwordHash,
            is_active: true,
            is_verified: true,
            is_super_admin: true
        });
        console.log('✅ Super Admin created: admin@mkanisa.com / Password@123');
    } else {
        console.log('ℹ️ Super Admin already exists.');
    }
}
