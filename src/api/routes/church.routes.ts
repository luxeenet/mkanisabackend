import { Router, Response } from 'express';
import { IAuthRequest } from '@api/middlewares/auth.middleware';
import db from '@infrastructure/database/knex';
import { logger } from '@services/logger';
import { MemberService } from '@application/services/member.service';
import { KnexMemberRepository } from '@infrastructure/database/repositories/member.repository';
import { CreateMemberSchema, ListMemberQuerySchema, UpdateMemberSchema } from '@api/validations/member.schema';

const router = Router();
const memberRepository = new KnexMemberRepository();
const memberService = new MemberService(memberRepository);

// 1. Get Church Analytics
router.get('/analytics', async (req: IAuthRequest, res: Response) => {
    try {
        const { churchId, tenantId } = req.user!;

        const memberCount = await db('members').where({ church_id: churchId }).count('id as count').first();
        const transactionSum = await db('transactions')
            .where({ church_id: churchId, status: 'SUCCESS' })
            .sum('amount as total')
            .first();

        res.status(200).json({
            churchId,
            members: parseInt(memberCount?.count as string || '0'),
            totalCollections: parseFloat(transactionSum?.total as string || '0'),
            currency: 'TZS'
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// 2. List Members
router.get('/members', async (req: IAuthRequest, res: Response) => {
    try {
        const { churchId } = req.user!;
        const query = ListMemberQuerySchema.parse(req.query);

        const result = await memberService.listMembers(churchId!, query);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Register Member
router.post('/members', async (req: IAuthRequest, res: Response) => {
    try {
        const { churchId } = req.user!;
        const memberData = CreateMemberSchema.parse(req.body);

        const member = await memberService.registerMember(churchId!, memberData as any);
        res.status(201).json(member);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// 4. Update Member
router.patch('/members/:id', async (req: IAuthRequest, res: Response) => {
    try {
        const { churchId } = req.user!;
        const { id } = req.params;
        const updateData = UpdateMemberSchema.parse(req.body);

        const member = await memberService.updateMember(id as string, churchId!, updateData as any);
        res.status(200).json(member);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// 5. Delete Member
router.delete('/members/:id', async (req: IAuthRequest, res: Response) => {
    try {
        const { churchId } = req.user!;
        const { id } = req.params;

        await memberService.deleteMember(id as string, churchId!);
        res.status(204).send();
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
