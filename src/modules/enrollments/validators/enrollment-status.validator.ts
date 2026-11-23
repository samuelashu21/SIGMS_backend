
import { z } from 'zod';

export const updateEnrollmentStatusSchema = z.object({
  status: z.enum([
    'ACTIVE',
    'SUSPENDED',
    'WITHDRAWN',
    'COMPLETED',
    'CANCELLED'
  ]),
  reason: z.string().trim().min(3).max(1000)
});
