
import { z } from 'zod';

export const createSubjectSchedulingRequirementSchema = z.object({
  academicYearId: z.string().uuid(),
  gradeId: z.string().uuid(),
  subjectId: z.string().uuid(),
  requiredPeriodsPerWeek: z.number().int().min(1).max(50),
  maximumPeriodsPerDay: z.number().int().min(1).max(10),
  allowConsecutivePeriods: z.boolean().default(false)
});

export const updateSubjectSchedulingRequirementSchema = z.object({
  requiredPeriodsPerWeek: z.number().int().min(1).max(50).optional(),
  maximumPeriodsPerDay: z.number().int().min(1).max(10).optional(),
  allowConsecutivePeriods: z.boolean().optional(),
  isActive: z.boolean().optional()
});
