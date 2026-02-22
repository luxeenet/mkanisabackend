import { Router, Request, Response } from 'express';
import { AuthUseCases } from '@application/use-cases/auth.use-cases';
import { KnexUserRepository } from '@infrastructure/database/repositories/user.repository';
import { KnexTenantRepository } from '@infrastructure/database/repositories/tenant.repository';
import { ITenantRequest } from '@api/middlewares/tenant.middleware';

const router = Router();
const userRepository = new KnexUserRepository();
const tenantRepository = new KnexTenantRepository();
const authUseCases = new AuthUseCases(userRepository, tenantRepository);

router.post('/register', async (req: ITenantRequest, res: Response) => {
    try {
        if (!req.tenantId) {
            return res.status(400).json({ message: 'X-Tenant-ID header is required' });
        }

        const result = await authUseCases.register(req.body, req.tenantId);
        res.status(201).json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/login', async (req: ITenantRequest, res: Response) => {
    try {
        if (!req.tenantId) {
            return res.status(400).json({ message: 'X-Tenant-ID header is required' });
        }

        const result = await authUseCases.login(req.body, req.tenantId);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(401).json({ message: err.message });
    }
});

export default router;
