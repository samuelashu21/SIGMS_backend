
import { z } from 'zod';

export const createStudentTransferSchema = z.object({
  destinationSchoolId: z.string().uuid().nullable().optional(),
  transferType: z.enum(['INTERNAL', 'EXTERNAL']),
  reason: z.string().trim().min(5).max(1000)
}).superRefine((data, ctx) => {
  if (
    data.transferType === 'EXTERNAL' &&
    !data.destinationSchoolId
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['destinationSchoolId'],
      message: 'Destination school is required for an external transfer.'
    });
  }

  if (
    data.transferType === 'INTERNAL' &&
    data.destinationSchoolId
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['destinationSchoolId'],
      message: 'Internal transfers do not require another school.'
    });
  }
});

export const decideStudentTransferSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  decisionReason: z.string().trim().min(3).max(1000)
});

export type CreateStudentTransferInput = z.infer<
  typeof createStudentTransferSchema
>;
