import { Request, Response, NextFunction } from 'express';
import { logger } from '@services/logger';

export interface ITenantRequest extends Request {
    tenantId?: string;
}

export const tenantMiddleware = (req: ITenantRequest, res: Response, next: NextFunction) => {
    const tenantId = req.header('X-Tenant-ID') || req.query.tenantId as string;

    if (!tenantId && req.path !== '/health' && req.path !== '/') {
        logger.warn(`Missing Tenant ID for path: ${req.path}`);
    }

    req.tenantId = tenantId;
    next();
};
