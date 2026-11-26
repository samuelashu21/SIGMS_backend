
import { z } from 'zod';

export const updateExaminationStatusSchema = z.object({
  status: z.enum([
    'SCHEDULED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED'
  ]),
  reason: z.string().trim().min(3).max(1000).optional()
}).refine(
  (data) =>
    data.status !== 'CANCELLED' ||
    Boolean(data.reason),
  {
    path: ['reason'],
    message: 'A cancellation reason is required.'
  }
);
