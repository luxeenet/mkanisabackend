import { IMember } from '../entities/church';

export interface IMemberRepository {
    findById(id: string, churchId: string): Promise<IMember | null>;
    findByPhoneNumber(phone: string, churchId: string): Promise<IMember | null>;
    list(churchId: string, params: {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
    }): Promise<{ members: IMember[]; total: number }>;
    create(member: Partial<IMember>): Promise<IMember>;
    update(id: string, churchId: string, member: Partial<IMember>): Promise<IMember>;
    delete(id: string, churchId: string): Promise<void>;
}
