
import { z } from 'zod';

export const createMarkCorrectionSchema = z.object({
  obtainedMarks: z.coerce.number().min(0).max(100000),
  bonusMarks: z.coerce.number().min(0).max(100000).default(0),
  penaltyMarks: z.coerce.number().min(0).max(100000).default(0),
  reason: z.string().trim().min(5).max(2000)
});

export const reviewMarkCorrectionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  reviewNotes: z.string().trim().max(2000).optional()
}).superRefine((data, ctx) => {
  if (data.decision === 'REJECT' && !data.reviewNotes) {
    ctx.addIssue({
      code: 'custom',
      path: ['reviewNotes'],
      message: 'Review notes are required when rejecting a correction.'
    });
  }
});
