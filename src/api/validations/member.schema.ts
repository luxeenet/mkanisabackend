import { z } from 'zod';

export const CreateMemberSchema = z.object({
    fullName: z.string().min(3),
    phoneNumber: z.string().min(10).max(15),
    email: z.string().email().optional().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    dateOfBirth: z.string().optional().nullable(), // Will parse to Date
    memberType: z.enum(['REGULAR', 'PARTNER', 'VISITOR']).default('REGULAR'),
    metadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateMemberSchema = CreateMemberSchema.partial();

export const ListMemberQuerySchema = z.object({
    page: z.string().optional().transform(v => parseInt(v || '1')),
    limit: z.string().optional().transform(v => parseInt(v || '10')),
    search: z.string().optional(),
    type: z.string().optional(),
});
