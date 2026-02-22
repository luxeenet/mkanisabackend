import { ITenant, IUser } from '../entities/identity';

export interface ITenantRepository {
    findById(id: string): Promise<ITenant | null>;
    findBySlug(slug: string): Promise<ITenant | null>;
    findByDomain(domain: string): Promise<ITenant | null>;
    create(tenant: Partial<ITenant>): Promise<ITenant>;
}

export interface IUserRepository {
    findById(id: string): Promise<IUser | null>;
    findByEmail(email: string, tenantId: string): Promise<IUser | null>;
    findByPhoneNumber(phoneNumber: string, tenantId: string): Promise<IUser | null>;
    create(user: Partial<IUser>): Promise<IUser>;
    update(id: string, user: Partial<IUser>): Promise<IUser>;
}
