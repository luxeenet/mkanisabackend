import { Knex } from 'knex';
import db from '@infrastructure/database/knex';
import { PaymentGateway } from '@infrastructure/database/gateway/payment.gateway';
import { logger } from '@services/logger';

export class SubscriptionService {
    static async activatePlan(churchId: string, planId: string, tenantId: string, trx?: Knex.Transaction) {
        const queryBuilder = trx || db;

        const plan = await queryBuilder('plans').where({ id: planId }).first();
        if (!plan) throw new Error('Plan not found');

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);

        const subscription = await queryBuilder('subscriptions').insert({
            church_id: churchId,
            plan_id: planId,
            start_date: new Date(),
            end_date: endDate,
            status: 'ACTIVE'
        }).returning('*');

        logger.info(`Subscription activated for church ${churchId} on plan ${plan.name}`);
        return subscription[0];
    }

    static async initiatePayment(memberId: string, amount: number, type: string, phone: string, churchId: string, tenantId: string, planId?: string, trx?: Knex.Transaction) {
        const queryBuilder = trx || db;
        const internalRef = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        // 1. Create PENDING transaction record
        const [transaction] = await queryBuilder('transactions').insert({
            tenant_id: tenantId,
            church_id: churchId,
            member_id: memberId,
            amount,
            type,
            status: 'PENDING',
            provider: 'M-PESA', // Default to M-Pesa for now
            internal_reference: internalRef,
            provider_response: planId ? { planId } : null
        }).returning('*');

        // 2. Trigger STK Push (Mock)
        const gatewayResult = await PaymentGateway.initiateMpesaSTK({
            amount,
            phone,
            reference: internalRef,
            type: type as any
        });

        // 3. Update with provider reference
        await queryBuilder('transactions')
            .where({ id: transaction.id })
            .update({ provider_reference: gatewayResult.transactionId });

        return { transaction, gatewayResult };
    }
}
