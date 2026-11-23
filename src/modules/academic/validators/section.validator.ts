
import { z } from 'zod';

export const createSectionSchema = z.object({
  gradeId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  name: z.string().trim().min(1).max(50),
  capacity: z.number().int().min(1).max(200).optional(),
  room: z.string().trim().max(50).optional()
});

export const updateSectionSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  capacity: z.number().int().min(1).max(200).nullable().optional(),
  room: z.string().trim().max(50).nullable().optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one section field is required.' }
);

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
