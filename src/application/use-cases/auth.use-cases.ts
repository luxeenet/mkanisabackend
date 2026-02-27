import argon2 from 'argon2';
import { IUserRepository, ITenantRepository } from '@domain/repositories/identity.repository';
import { JwtService } from '@infrastructure/security/jwt.service';
import { logger } from '@services/logger';

export class AuthUseCases {
    constructor(
        private userRepository: IUserRepository,
        private tenantRepository: ITenantRepository
    ) { }

    async register(data: any, tenantId: string) {
        // 1. Check if user already exists in this tenant
        const existingUser = await this.userRepository.findByPhoneNumber(data.phoneNumber, tenantId);
        if (existingUser) {
            throw new Error('User already exists in this church/tenant');
        }

        // 2. Hash password
        const passwordHash = await argon2.hash(data.password);

        // 3. Create user
        const user = await this.userRepository.create({
            tenantId,
            churchId: data.churchId,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            passwordHash,
            isActive: true,
            roleId: data.roleId,
        });

        logger.info(`New user registered: ${user.phoneNumber} in tenant ${tenantId}`);

        // 4. Generate tokens
        const accessToken = JwtService.generateToken({
            userId: user.id,
            tenantId: user.tenantId,
            churchId: user.churchId,
            role: 'MEMBER', // Default role for now
        });

        return { user, accessToken };
    }

    async login(data: any, tenantId: string) {
        let user = await this.userRepository.findByPhoneNumber(data.phoneNumber, tenantId);

        // If not found by phone, try by email (especially for Super Admin)
        if (!user && data.email) {
            user = await this.userRepository.findByEmail(data.email, tenantId);
        }

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await argon2.verify(user.passwordHash, data.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const accessToken = JwtService.generateToken({
            userId: user.id,
            tenantId: user.tenantId,
            churchId: user.churchId,
            role: user.isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN',
        });


        return { user, accessToken };
    }

}
