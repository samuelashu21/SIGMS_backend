
import { z } from 'zod';

export const updateAdmissionStatusSchema = z.object({
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'NEEDS_INFORMATION',
    'WITHDRAWN'
  ]),
  reason: z.string().trim().min(3).max(2000)
});

export type UpdateAdmissionStatusInput = z.infer<
  typeof updateAdmissionStatusSchema
>;
