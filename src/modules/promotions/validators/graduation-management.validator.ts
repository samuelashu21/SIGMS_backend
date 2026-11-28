
import { z } from 'zod';

export const assessGraduationCandidateSchema = z.object({
  studentId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  configurationId: z.string().uuid()
});

export const reviewGraduationCandidateSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().trim().min(5).max(3000)
});
