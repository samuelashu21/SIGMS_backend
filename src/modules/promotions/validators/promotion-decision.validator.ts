
import { z } from 'zod';

export const promotionDecisionSchema = z.object({
  studentId: z.string().uuid(),
  currentEnrollmentId: z.string().uuid(),
  eligibilityAssessmentId: z.string().uuid(),
  configurationId: z.string().uuid(),
  nextAcademicYearId: z.string().uuid(),
  targetGradeId: z.string().uuid(),
  targetSectionId: z.string().uuid(),
  reason: z.string().trim().max(3000).optional(),
  overrideReason: z.string().trim().min(10).max(3000).optional()
});
