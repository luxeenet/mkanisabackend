import { Router, Request, Response } from 'express';
import db from '@infrastructure/database/knex';
import { logger } from '@services/logger';
import { SubscriptionService } from '@application/services/subscription.service';
import { authMiddleware, IAuthRequest } from '@api/middlewares/auth.middleware';

const router = Router();

// Initiate Subscription Payment
router.post('/initiate-subscription', authMiddleware, async (req: IAuthRequest, res: Response) => {
    try {
        const { planId, phone } = req.body;
        const { userId, churchId, tenantId } = req.user!;
        if (!churchId) return res.status(400).json({ message: 'User must be associated with a church' });

        const plan = await db('plans').where({ id: planId }).first();
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const result = await SubscriptionService.initiatePayment(
            userId,
            plan.price,
            'SUBSCRIPTION',
            phone,
            churchId,
            tenantId,
            planId
        );

        res.status(200).json(result);
    } catch (err: any) {
        logger.error(`Error initiating subscription: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
});

// M-Pesa / Airtel Money Callback
router.post('/callback/:provider', async (req: Request, res: Response) => {
    const { provider } = req.params;
    const payload = req.body;

    logger.info(`Received ${provider} payment callback: ${JSON.stringify(payload)}`);

    // 1. Verify Signature (Security Requirement)
    // In production, use provider public keys to verify payload

    try {
        const internalRef = payload.internalReference; // Example field
        const status = payload.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';

        // 2. Update Transaction
        const [transaction] = await db('transactions')
            .where({ internal_reference: internalRef })
            .update({
                status,
                provider_response: payload,
                updated_at: new Date()
            })
            .returning('*');

        if (status === 'SUCCESS' && transaction.type === 'SUBSCRIPTION') {
            const planId = transaction.provider_response?.planId;
            if (planId) {
                await SubscriptionService.activatePlan(
                    transaction.church_id,
                    planId,
                    transaction.tenant_id
                );
                logger.info(`Subscription activated for church ${transaction.church_id} on plan ${planId}`);
            }
        }

        res.status(200).json({ message: 'Callback processed' });
    } catch (err: any) {
        logger.error(`Error processing callback: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
