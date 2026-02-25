import 'module-alias/register';
import db from '../src/infrastructure/database/knex';
import argon2 from 'argon2';

async function createAdmin() {
    try {
        console.log('🚀 Starting Super Admin creation...');

        // 1. Create a Platform/System Tenant if it doesn't exist
        let platformTenant = await db('tenants').where({ slug: 'system' }).first();
        if (!platformTenant) {
            console.log('Creating System Tenant...');
            [platformTenant] = await db('tenants').insert({
                name: 'M-KANISA Platform',
                slug: 'system',
                is_active: true
            }).returning('*');
        }

        // 2. Create Super Admin User
        const existingAdmin = await db('users').where({ email: 'admin@mkanisa.com' }).first();
        if (!existingAdmin) {
            console.log('Creating Super Admin user...');
            const passwordHash = await argon2.hash('Password@123');
            await db('users').insert({
                tenant_id: platformTenant.id,
                full_name: 'Platform Administrator',
                email: 'admin@mkanisa.com',
                phone_number: '255000000000',
                password_hash: passwordHash,
                is_active: true,
                is_verified: true,
                is_super_admin: true
            });
            console.log('✅ Super Admin created successfully!');
            console.log('   Email: admin@mkanisa.com');
            console.log('   Password: Password@123');
        } else {
            console.log('ℹ️ Super Admin already exists (admin@mkanisa.com)');
        }
    } catch (err) {
        console.error('❌ Failed to create admin:', err);
    } finally {
        await db.destroy();
        process.exit(0);
    }
}

createAdmin();
