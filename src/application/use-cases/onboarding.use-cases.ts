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
                // Try to find the plan by ID or partial name (e.g. 'kagash')
                const plan = await trx('plans')
                    .where({ id: data.planId })
                    .orWhere('name', 'ilike', `%${data.planId.split('-')[0]}%`)
                    .first();

                if (plan) {
                    if (Number(plan.price) === 0) {
                        // Activate free plan immediately
                        await SubscriptionService.activatePlan(church.id, plan.id, tenant.id);
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
                            plan.id
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
}
