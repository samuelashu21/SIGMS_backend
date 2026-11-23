
import { z } from 'zod';

export const createGradeSubjectSchema = z.object({
  gradeId: z.string().uuid(),
  subjectId: z.string().uuid(),
  weeklyPeriods: z.number().int().min(1).max(50).default(3),
  isCompulsory: z.boolean().default(true)
});

export const updateGradeSubjectSchema = z.object({
  weeklyPeriods: z.number().int().min(1).max(50).optional(),
  isCompulsory: z.boolean().optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one assignment field is required.' }
);

export type CreateGradeSubjectInput = z.infer<
  typeof createGradeSubjectSchema
>;

export type UpdateGradeSubjectInput = z.infer<
  typeof updateGradeSubjectSchema
>;
