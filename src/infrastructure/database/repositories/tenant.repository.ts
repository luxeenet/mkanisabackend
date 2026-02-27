import { ITenantRepository } from '@domain/repositories/identity.repository';
import { ITenant } from '@domain/entities/identity';
import db from '../knex';

export class KnexTenantRepository implements ITenantRepository {
    private readonly tableName = 'tenants';

    private mapToEntity(row: any): ITenant {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            domain: row.domain,
            logoUrl: row.logo_url,
            primaryColor: row.primary_color,
            isActive: row.is_active,
            settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    async findById(id: string): Promise<ITenant | null> {
        const row = await db(this.tableName).where({ id }).first();
        return row ? this.mapToEntity(row) : null;
    }

    async findBySlug(slug: string): Promise<ITenant | null> {
        const row = await db(this.tableName).where({ slug }).first();
        return row ? this.mapToEntity(row) : null;
    }

    async findByDomain(domain: string): Promise<ITenant | null> {
        const row = await db(this.tableName).where({ domain }).first();
        return row ? this.mapToEntity(row) : null;
    }

    async create(tenant: Partial<ITenant>): Promise<ITenant> {
        const [row] = await db(this.tableName).insert(tenant).returning('*');
        return this.mapToEntity(row);
    }
}
