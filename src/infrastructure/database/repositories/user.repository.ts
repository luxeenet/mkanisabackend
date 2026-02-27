import { IUserRepository } from '@domain/repositories/identity.repository';
import { IUser } from '@domain/entities/identity';
import db from '../knex';

export class KnexUserRepository implements IUserRepository {
    private readonly tableName = 'users';

    private mapToEntity(row: any): IUser {
        return {
            id: row.id,
            tenantId: row.tenant_id,
            churchId: row.church_id,
            email: row.email,
            phoneNumber: row.phone_number,
            passwordHash: row.password_hash,
            fullName: row.full_name,
            avatarUrl: row.avatar_url,
            roleId: row.role_id,
            isActive: row.is_active,
            isVerified: row.is_verified,
            isSuperAdmin: row.is_super_admin,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async findById(id: string): Promise<IUser | null> {
        const row = await db(this.tableName).where({ id }).first();
        return row ? this.mapToEntity(row) : null;
    }

    async findByEmail(email: string, tenantId: string): Promise<IUser | null> {
        const row = await db(this.tableName).where({ email, tenant_id: tenantId }).first();
        return row ? this.mapToEntity(row) : null;
    }

    async findByPhoneNumber(phoneNumber: string, tenantId: string): Promise<IUser | null> {
        const row = await db(this.tableName).where({ phone_number: phoneNumber, tenant_id: tenantId }).first();
        return row ? this.mapToEntity(row) : null;
    }

    async create(user: Partial<IUser>): Promise<IUser> {
        const [row] = await db(this.tableName).insert(user).returning('*');
        return this.mapToEntity(row);
    }

    async update(id: string, user: Partial<IUser>): Promise<IUser> {
        const [row] = await db(this.tableName).where({ id }).update(user).returning('*');
        return this.mapToEntity(row);
    }
}
