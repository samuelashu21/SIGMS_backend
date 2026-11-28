
import { z } from 'zod';

export const reportPublicationSchema = z.object({
  reportType: z.enum([
    'REPORT_CARD',
    'TRANSCRIPT',
    'ATTENDANCE',
    'EXAMINATION'
  ]),
  reportId: z.string().uuid(),
  action: z.enum(['PUBLISH', 'WITHDRAW']),
  reason: z.string().trim().max(2000).optional()
});
