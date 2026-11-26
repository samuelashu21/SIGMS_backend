
import { z } from 'zod';

export const subjectWeightSchema = z.object({
  academicYearId: z.string().uuid(),
  gradeId: z.string().uuid(),
  subjectId: z.string().uuid(),
  weight: z.coerce.number().positive().max(10000)
});

export const semesterWeightSchema = z.object({
  academicYearId: z.string().uuid(),
  semesterId: z.string().uuid(),
  weight: z.coerce.number().positive().max(10000)
});

export const updateWeightSchema = z.object({
  weight: z.coerce.number().positive().max(10000),
  isActive: z.boolean().optional()
});
