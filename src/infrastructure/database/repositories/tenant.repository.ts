import { ITenantRepository } from '@domain/repositories/identity.repository';
import { ITenant } from '@domain/entities/identity';
import db from '../knex';

export class KnexTenantRepository implements ITenantRepository {
    private readonly tableName = 'tenants';

    async findById(id: string): Promise<ITenant | null> {
        const tenant = await db(this.tableName).where({ id }).first();
        return tenant || null;
    }

    async findBySlug(slug: string): Promise<ITenant | null> {
        const tenant = await db(this.tableName).where({ slug }).first();
        return tenant || null;
    }

    async findByDomain(domain: string): Promise<ITenant | null> {
        const tenant = await db(this.tableName).where({ domain }).first();
        return tenant || null;
    }

    async create(tenant: Partial<ITenant>): Promise<ITenant> {
        const [createdTenant] = await db(this.tableName).insert(tenant).returning('*');
        return createdTenant;
    }
}
