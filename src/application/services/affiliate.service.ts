import argon2 from 'argon2';
import db from '@infrastructure/database/knex';
import { logger } from '@services/logger';
import { SubscriptionService } from '@application/services/subscription.service';

export class AffiliateService {
    static async onboard(data: any) {
        const { name, phone, email, slug, password } = data;

        return await db.transaction(async (trx) => {
            // 1. Create Tenant
            const [tenant] = await trx('tenants').insert({
                name,
                slug,
                settings: { is_affiliate: true }
            }).returning('*');

            // 2. Create Parent Church
            const [church] = await trx('churches').insert({
                tenant_id: tenant.id,
                name: `${name} Main Church`,
                contact_phone: phone,
                contact_email: email
            }).returning('*');

            // 3. Create Admin User
            const passwordHash = await argon2.hash(password);
            const [user] = await trx('users').insert({
                tenant_id: tenant.id,
                church_id: church.id,
                full_name: 'Affiliate Admin',
                phone_number: phone,
                email,
                password_hash: passwordHash,
                is_active: true
            }).returning('*');

            logger.info(`Affiliate onboarded successfully: ${name} (${tenant.id})`);

            return { tenant, church, user };
        });
    }
}
