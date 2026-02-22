import { IUserRepository } from '@domain/repositories/identity.repository';
import { IUser } from '@domain/entities/identity';
import db from '../knex';

export class KnexUserRepository implements IUserRepository {
    private readonly tableName = 'users';

    async findById(id: string): Promise<IUser | null> {
        const user = await db(this.tableName).where({ id }).first();
        return user || null;
    }

    async findByEmail(email: string, tenantId: string): Promise<IUser | null> {
        const user = await db(this.tableName).where({ email, tenant_id: tenantId }).first();
        return user || null;
    }

    async findByPhoneNumber(phoneNumber: string, tenantId: string): Promise<IUser | null> {
        const user = await db(this.tableName).where({ phone_number: phoneNumber, tenant_id: tenantId }).first();
        return user || null;
    }

    async create(user: Partial<IUser>): Promise<IUser> {
        const [createdUser] = await db(this.tableName).insert(user).returning('*');
        return createdUser;
    }

    async update(id: string, user: Partial<IUser>): Promise<IUser> {
        const [updatedUser] = await db(this.tableName).where({ id }).update(user).returning('*');
        return updatedUser;
    }
}
