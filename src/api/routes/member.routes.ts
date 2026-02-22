import { Router, Response } from 'express';
import { IAuthRequest } from '@api/middlewares/auth.middleware';
import db from '@infrastructure/database/knex';
import { logger } from '@services/logger';

const router = Router();

// 1. Get Member Profile
router.get('/profile', async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const member = await db('members').where({ user_id: userId }).first();
        if (!member) return res.status(404).json({ message: 'Member profile not found' });

        res.status(200).json(member);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Get Donation History
router.get('/donations', async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const member = await db('members').where({ user_id: userId }).first();
        if (!member) return res.status(404).json({ message: 'Member not found' });

        const donations = await db('transactions')
            .where({ member_id: member.id, status: 'SUCCESS' })
            .orderBy('created_at', 'desc');

        res.status(200).json(donations);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Get Certificates
router.get('/certificates', async (req: IAuthRequest, res: Response) => {
    try {
        const { userId } = req.user!;
        const member = await db('members').where({ user_id: userId }).first();
        if (!member) return res.status(404).json({ message: 'Member not found' });

        const certificates = await db('certificates')
            .where({ member_id: member.id })
            .orderBy('issued_at', 'desc');

        res.status(200).json(certificates);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
