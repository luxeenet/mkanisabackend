import { Router, Response } from 'express';
import { IAuthRequest } from '@api/middlewares/auth.middleware';
import { SmsEngine } from '@infrastructure/queues/sms.engine';
import { logger } from '@services/logger';

const router = Router();

// Send Broadcast SMS
router.post('/broadcast', async (req: IAuthRequest, res: Response) => {
    const { message, recipients } = req.body; // recipients is array of phones
    const { churchId } = req.user!;

    try {
        for (const phone of recipients) {
            await SmsEngine.scheduleSms({ phone, message, churchId: churchId as string });
        }

        res.status(202).json({
            message: `Broadcast of ${recipients.length} messages queued successfully`
        });
    } catch (err: any) {
        logger.error(`SMS Broadcast Error: ${err.message}`);
        res.status(500).json({ message: 'Failed to queue SMS' });
    }
});

export default router;
