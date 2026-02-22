import { IMemberRepository } from '@domain/repositories/member.repository';
import { IMember } from '@domain/entities/church';
import db from '../knex';

export class KnexMemberRepository implements IMemberRepository {
    private readonly tableName = 'members';

    async findById(id: string, churchId: string): Promise<IMember | null> {
        const member = await db(this.tableName)
            .where({ id, church_id: churchId })
            .first();
        return member || null;
    }

    async findByPhoneNumber(phone: string, churchId: string): Promise<IMember | null> {
        const member = await db(this.tableName)
            .where({ phone_number: phone, church_id: churchId })
            .first();
        return member || null;
    }

    async list(churchId: string, params: {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
    }): Promise<{ members: IMember[]; total: number }> {
        const { page = 1, limit = 10, search, type } = params;
        const offset = (page - 1) * limit;

        const query = db(this.tableName).where({ church_id: churchId });

        if (type) {
            query.where({ member_type: type });
        }

        if (search) {
            query.where((q) => {
                q.where('full_name', 'ilike', `%${search}%`)
                    .orWhere('phone_number', 'ilike', `%${search}%`)
                    .orWhere('registration_number', 'ilike', `%${search}%`);
            });
        }

        const totalQuery = query.clone().count('id as count').first();
        const recordsQuery = query.clone()
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);

        const [totalResult, members] = await Promise.all([totalQuery, recordsQuery]);

        return {
            members,
            total: parseInt(totalResult?.count as string || '0')
        };
    }

    async create(member: Partial<IMember>): Promise<IMember> {
        // Map camelCase to snake_case if necessary, or assume knex handles it if using plugin
        // Based on existing migrations, it uses snake_case in DB
        const dbMember = {
            church_id: member.churchId,
            registration_number: member.registrationNumber,
            full_name: member.fullName,
            phone_number: member.phoneNumber,
            email: member.email,
            gender: member.gender,
            date_of_birth: member.dateOfBirth,
            member_type: member.memberType,
            is_active: member.isActive,
            metadata: member.metadata,
        };

        const [createdMember] = await db(this.tableName).insert(dbMember).returning('*');
        return createdMember;
    }

    async update(id: string, churchId: string, member: Partial<IMember>): Promise<IMember> {
        const updateData: any = {};
        if (member.fullName) updateData.full_name = member.fullName;
        if (member.email) updateData.email = member.email;
        if (member.phoneNumber) updateData.phone_number = member.phoneNumber;
        if (member.gender) updateData.gender = member.gender;
        if (member.dateOfBirth) updateData.date_of_birth = member.dateOfBirth;
        if (member.memberType) updateData.member_type = member.memberType;
        if (member.isActive !== undefined) updateData.is_active = member.isActive;
        if (member.metadata) updateData.metadata = member.metadata;

        const [updatedMember] = await db(this.tableName)
            .where({ id, church_id: churchId })
            .update(updateData)
            .returning('*');

        return updatedMember;
    }

    async delete(id: string, churchId: string): Promise<void> {
        await db(this.tableName).where({ id, church_id: churchId }).delete();
    }
}
