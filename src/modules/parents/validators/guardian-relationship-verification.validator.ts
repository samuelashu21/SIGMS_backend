
import { z } from 'zod';

export const verifyGuardianRelationshipSchema = z.object({
  decision: z.enum(['VERIFIED', 'REJECTED']),
  verificationNotes: z.string().trim().max(1000).optional()
}).refine(
  (data) =>
    data.decision !== 'REJECTED' ||
    Boolean(data.verificationNotes?.trim()),
  {
    path: ['verificationNotes'],
    message: 'A reason is required when rejecting a relationship.'
  }
);
