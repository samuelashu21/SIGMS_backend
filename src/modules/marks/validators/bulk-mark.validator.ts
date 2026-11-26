
import { z } from 'zod';

const bulkMarkItemSchema = z.object({
  studentId: z.string().uuid(),
  obtainedMarks: z.coerce.number().min(0).max(100000),
  bonusMarks: z.coerce.number().min(0).max(100000).default(0),
  penaltyMarks: z.coerce.number().min(0).max(100000).default(0),
  remarks: z.string().trim().max(2000).optional()
});

export const bulkMarkEntrySchema = z.object({
  examinationId: z.string().uuid(),
  records: z.array(bulkMarkItemSchema).min(1).max(200)
}).superRefine((data, ctx) => {
  const studentIds = data.records.map((record) => record.studentId);

  if (new Set(studentIds).size !== studentIds.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['records'],
      message: 'A student can appear only once in a bulk marks request.'
    });
  }
});
