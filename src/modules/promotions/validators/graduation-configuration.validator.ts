
import { z } from 'zod';

export const createGraduationConfigurationSchema = z.object({
  academicYearId: z.string().uuid(),
  terminalGradeId: z.string().uuid(),
  name: z.string().trim().min(3).max(150),

  minimumOverallPercentage: z.number().min(0).max(100).optional(),
  minimumGradePoint: z.number().min(0).max(5).optional(),
  minimumAttendancePercentage: z.number().min(0).max(100).optional(),

  minimumPassedSubjects: z.number().int().min(0).default(0),
  maximumFailedSubjects: z.number().int().min(0).default(0),

  requireCompletedExaminations: z.boolean().default(true),
  requireApprovedResults: z.boolean().default(true),
  requireAllCoreSubjectsPassed: z.boolean().default(true)
});
