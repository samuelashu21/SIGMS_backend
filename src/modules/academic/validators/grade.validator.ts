
import { z } from 'zod';

export const createGradeSchema = z.object({
  name: z.string().trim().min(2).max(50),
  gradeLevel: z.number().int().min(1).max(12),
  description: z.string().trim().max(500).optional()
});

export const updateGradeSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  gradeLevel: z.number().int().min(1).max(12).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one grade field is required.' }
);

export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;
