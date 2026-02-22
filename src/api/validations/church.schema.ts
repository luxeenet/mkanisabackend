import { z } from 'zod';

export const CreateBranchSchema = z.object({
    name: z.string().min(2),
    location: z.string().optional(),
    pastor_name: z.string().optional(),
});

export const UpdateBranchSchema = CreateBranchSchema.partial();
