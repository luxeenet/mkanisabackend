import { Router, Response } from 'express';
import { IAuthRequest } from '@api/middlewares/auth.middleware';
import db from '@infrastructure/database/knex';
import { logger } from '@services/logger';

const router = Router();

// 1. Global Analytics
router.get('/analytics', async (req: IAuthRequest, res: Response) => {
    try {
        const tenantCount = await db('tenants').count('id as count').first();
        const memberCount = await db('members').count('id as count').first();
        const transactionSum = await db('transactions')
            .where({ status: 'SUCCESS' })
            .sum('amount as total')
            .first();

        res.status(200).json({
            tenants: parseInt(tenantCount?.count as string || '0'),
            members: parseInt(memberCount?.count as string || '0'),
            totalRevenue: parseFloat(transactionSum?.total as string || '0'),
            currency: 'TZS'
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Tenant Management
router.get('/tenants', async (req: IAuthRequest, res: Response) => {
    try {
        const tenants = await db('tenants')
            .select('*')
            .orderBy('created_at', 'desc');
        res.status(200).json(tenants);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/tenants/:id/suspend', async (req: IAuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const tenant = await db('tenants').where({ id }).first();
        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

        const newStatus = !tenant.is_locked;
        await db('tenants').where({ id }).update({ is_locked: newStatus });

        res.status(200).json({ message: `Tenant ${newStatus ? 'suspended' : 'activated'} success` });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
