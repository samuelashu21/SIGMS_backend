
import { z } from 'zod';

export const reviewClassAttendanceSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  remarks: z.string().trim().max(1000).optional()
}).refine(
  (data) =>
    data.decision !== 'REJECTED' ||
    Boolean(data.remarks?.trim()),
  {
    path: ['remarks'],
    message: 'A reason is required when rejecting attendance.'
  }
);
