import { IMemberRepository } from '@domain/repositories/member.repository';
import { IMember } from '@domain/entities/church';
import { logger } from '@services/logger';

export class MemberService {
    constructor(private memberRepository: IMemberRepository) { }

    async registerMember(churchId: string, memberData: Partial<IMember>) {
        // 1. Check if already exists
        const existing = await this.memberRepository.findByPhoneNumber(memberData.phoneNumber!, churchId);
        if (existing) {
            throw new Error('Member with this phone number already exists in your church');
        }

        // 2. Generate Registration Number if not provided
        if (!memberData.registrationNumber) {
            const year = new Date().getFullYear();
            const random = Math.floor(1000 + Math.random() * 9000); // Simple random for now
            memberData.registrationNumber = `MEM-${year}-${random}`;
        }

        // 3. Create member
        const member = await this.memberRepository.create({
            ...memberData,
            churchId,
            isActive: true,
        });

        logger.info(`New member registered: ${member.fullName} (${member.registrationNumber}) in church ${churchId}`);
        return member;
    }

    async listMembers(churchId: string, params: any) {
        return this.memberRepository.list(churchId, params);
    }

    async updateMember(id: string, churchId: string, memberData: Partial<IMember>) {
        const member = await this.memberRepository.findById(id, churchId);
        if (!member) throw new Error('Member not found');

        return this.memberRepository.update(id, churchId, memberData);
    }

    async deleteMember(id: string, churchId: string) {
        const member = await this.memberRepository.findById(id, churchId);
        if (!member) throw new Error('Member not found');

        await this.memberRepository.delete(id, churchId);
    }
}
