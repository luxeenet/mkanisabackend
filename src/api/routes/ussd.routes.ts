import { Router, Request, Response } from 'express';
import { UssdService } from '@application/services/ussd.service';
import { logger } from '@services/logger';

const router = Router();
const ussdService = new UssdService();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { sessionId, phoneNumber, text, serviceCode } = req.body;

        logger.info(`USSD Request: ${phoneNumber} - ${text}`);

        const response = await ussdService.handleRequest(sessionId, phoneNumber, text || '');

        // Standard USSD Response format
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(response);
    } catch (err: any) {
        logger.error(`USSD Error: ${err.message}`);
        res.status(200).send('END System error. Please try again later.'); // Always return 200 for USSD gateways
    }
});

export default router;
