import { Router, Request, Response } from 'express';
import { OnboardingUseCases } from '@application/use-cases/onboarding.use-cases';
import { logger } from '@services/logger';

const router = Router();
const onboardingUseCases = new OnboardingUseCases();

router.post('/register', async (req: Request, res: Response) => {
    try {
        const result = await onboardingUseCases.registerChurch(req.body);
        res.status(201).json(result);
    } catch (err: any) {
        logger.error(`Error during onboarding registration: ${err.message}`);
        res.status(500).json({ message: err.message });
    }
});

router.get('/churches', async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string || '';
        const churches = await onboardingUseCases.searchChurches(query);
        res.status(200).json(churches);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
