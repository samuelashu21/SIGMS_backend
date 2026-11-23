
import { z } from 'zod';

export const createTeacherSubjectAssignmentSchema = z.object({
  subjectId: z.string().uuid(),
  gradeId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  weeklyPeriods: z.number().int().min(1).max(60)
});

export const updateTeacherSubjectAssignmentSchema = z.object({
  weeklyPeriods: z.number().int().min(1).max(60).optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one assignment field is required.' }
);
