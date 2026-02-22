import jwt from 'jsonwebtoken';
import { config } from '@config/index';

export interface IJwtPayload {
    userId: string;
    tenantId: string;
    churchId?: string;
    role: string;
}

export class JwtService {
    private static readonly accessSecret = config.jwt.secret;
    private static readonly refreshSecret = config.jwt.refreshSecret;
    private static readonly accessExp = config.jwt.accessExpiration;
    private static readonly refreshExp = config.jwt.refreshExpiration;

    static generateToken(payload: IJwtPayload): string {
        return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExp as any });
    }

    static generateRefreshToken(payload: IJwtPayload): string {
        return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExp as any });
    }

    static verifyToken(token: string): IJwtPayload {
        return jwt.verify(token, this.accessSecret) as IJwtPayload;
    }

    static verifyRefreshToken(token: string): IJwtPayload {
        return jwt.verify(token, this.refreshSecret) as IJwtPayload;
    }
}
