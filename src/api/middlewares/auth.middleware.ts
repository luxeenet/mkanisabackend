import { Response, NextFunction } from 'express';
import { JwtService, IJwtPayload } from '@infrastructure/security/jwt.service';
import { ITenantRequest } from './tenant.middleware';
import { logger } from '@services/logger';

export interface IAuthRequest extends ITenantRequest {
    user?: IJwtPayload;
}

export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = JwtService.verifyToken(token);

        // Verify tenant isolation
        if (req.tenantId && decoded.tenantId !== req.tenantId) {
            logger.error(`Tenant mismatch: Request Header(${req.tenantId}) vs Token(${decoded.tenantId})`);
            return res.status(403).json({ message: 'Access denied: Tenant mismatch' });
        }

        req.user = decoded;
        next();
    } catch (err: any) {
        logger.error(`Auth Middleware Error: ${err.message}`);
        return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
    }
};
