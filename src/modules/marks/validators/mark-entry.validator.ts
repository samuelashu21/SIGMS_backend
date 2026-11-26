
import { z } from 'zod';

export const createMarkEntrySchema = z.object({
  examinationId: z.string().uuid(),
  studentId: z.string().uuid(),

  obtainedMarks: z.coerce.number().min(0).max(100000),

  bonusMarks: z.coerce.number()
    .min(0)
    .max(100000)
    .default(0),

  penaltyMarks: z.coerce.number()
    .min(0)
    .max(100000)
    .default(0),

  remarks: z.string().trim().max(2000).optional()
});

export const updateMarkEntrySchema = z.object({
  obtainedMarks: z.coerce.number().min(0).max(100000).optional(),
  bonusMarks: z.coerce.number().min(0).max(100000).optional(),
  penaltyMarks: z.coerce.number().min(0).max(100000).optional(),
  remarks: z.string().trim().max(2000).nullable().optional()
});
