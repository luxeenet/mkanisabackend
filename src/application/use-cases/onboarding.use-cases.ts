import argon2 from 'argon2';
import db from '@infrastructure/database/knex';
import { logger } from '@services/logger';
import { JwtService } from '@infrastructure/security/jwt.service';
import { SubscriptionService } from '@application/services/subscription.service';

export class OnboardingUseCases {
    async registerChurch(data: any) {
        return await db.transaction(async (trx) => {
            // 1. Create Tenant
            const [tenant] = await trx('tenants').insert({
                name: data.churchName,
                slug: data.churchName.toLowerCase().replace(/ /g, '-'),
                settings: JSON.stringify({}),
            }).returning('*');

            // 2. Create Church
            const [church] = await trx('churches').insert({
                tenant_id: tenant.id,
                name: data.churchName,
                location: data.location,
                contact_phone: data.phoneNumber,
                contact_email: data.email,
            }).returning('*');

            // 3. Create Admin User
            const passwordHash = await argon2.hash(data.password);
            const [user] = await trx('users').insert({
                tenant_id: tenant.id,
                church_id: church.id,
                full_name: data.adminName,
                phone_number: data.phoneNumber,
                email: data.email,
                password_hash: passwordHash,
                is_active: true,
                is_verified: true, // Auto-verify for onboarding for now
            }).returning('*');

            logger.info(`New church onboarded: ${data.churchName} (Tenant: ${tenant.id})`);

            // 4. Handle Initial Subscription
            let paymentResult = null;
            if (data.planId) {
                // Try to find the plan by ID (if valid UUID) or partial name (e.g. 'kagash')
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.planId);

                const query = trx('plans');
                if (isUuid) {
                    query.where({ id: data.planId });
                } else {
                    query.where('name', 'ilike', `%${data.planId.split('-')[0]}%`);
                }

                const plan = await query.first();

                if (plan) {
                    if (Number(plan.price) === 0) {
                        // Activate free plan immediately
                        await SubscriptionService.activatePlan(church.id, plan.id, tenant.id, trx);
                    } else {
                        // Initiate payment for paid plan
                        // Note: Using the user.id as memberId for the initial payment
                        paymentResult = await SubscriptionService.initiatePayment(
                            user.id,
                            Number(plan.price),
                            'SUBSCRIPTION',
                            data.phoneNumber,
                            church.id,
                            tenant.id,
                            plan.id,
                            trx
                        );
                    }
                }
            }

            // 5. Generate tokens
            const accessToken = JwtService.generateToken({
                userId: user.id,
                tenantId: tenant.id,
                churchId: church.id,
                role: 'ADMIN',
            });

            return { tenant, church, user, accessToken, paymentResult };
        });
    }

    async searchChurches(query: string) {
        return await db('churches')
            .join('tenants', 'churches.tenant_id', 'tenants.id')
            .where('churches.name', 'ilike', `%${query}%`)
            .select('churches.name', 'tenants.slug', 'tenants.id');
    }

    async resolveBySlug(slug: string) {
        return await db('tenants')
            .where({ slug })
            .first();
    }

    async setupAdmin() {
        return await db.transaction(async (trx) => {
            // 1. Create a Platform/System Tenant if it doesn't exist
            let platformTenant = await trx('tenants').where({ slug: 'system' }).first();
            if (!platformTenant) {
                [platformTenant] = await trx('tenants').insert({
                    name: 'M-KANISA Platform',
                    slug: 'system',
                    is_active: true
                }).returning('*');
            }

            // 2. Create Super Admin User
            const existingAdmin = await trx('users').where({ is_super_admin: true }).first();
            if (existingAdmin) {
                throw new Error('Super Admin already exists. Please use the login page.');
            }

            const passwordHash = await argon2.hash('Password@123');
            const [user] = await trx('users').insert({
                tenant_id: platformTenant.id,
                full_name: 'Platform Administrator',
                email: 'admin@mkanisa.com',
                phone_number: '255000000000',
                password_hash: passwordHash,
                is_active: true,
                is_verified: true,
                is_super_admin: true
            }).returning('*');

            return {
                message: 'Super Admin created successfully',
                credentials: {
                    identifier: 'admin@mkanisa.com',
                    password: 'Password@123'
                },
                user
            };
        });
    }
}
