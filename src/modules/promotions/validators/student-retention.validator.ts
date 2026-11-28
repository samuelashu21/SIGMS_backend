
import { z } from 'zod';

export const studentRetentionSchema = z.object({
  studentId: z.string().uuid(),
  currentEnrollmentId: z.string().uuid(),
  eligibilityAssessmentId: z.string().uuid(),
  configurationId: z.string().uuid(),
  nextAcademicYearId: z.string().uuid(),
  targetSectionId: z.string().uuid(),
  reason: z.string().trim().min(10).max(3000)
});
