
import { z } from 'zod';

export const markApprovalSchema = z.object({
  examinationId: z.string().uuid(),
  decision: z.enum(['APPROVE', 'REJECT']),
  reviewNotes: z.string().trim().max(2000).optional()
}).superRefine((data, ctx) => {
  if (data.decision === 'REJECT' && !data.reviewNotes) {
    ctx.addIssue({
      code: 'custom',
      path: ['reviewNotes'],
      message: 'Review notes are required when rejecting marks.'
    });
  }
});
