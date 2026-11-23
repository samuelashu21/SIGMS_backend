
import { z } from 'zod';

const dateSchema = z.iso.date();

export const createSemesterSchema = z.object({
  academicYearId: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  sequence: z.number().int().min(1).max(20),
  startDate: dateSchema,
  endDate: dateSchema
}).refine(
  (data) => data.startDate < data.endDate,
  {
    message: 'Semester end date must be after its start date.',
    path: ['endDate']
  }
);

export const updateSemesterSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  sequence: z.number().int().min(1).max(20).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided.' }
);

export type CreateSemesterInput = z.infer<
  typeof createSemesterSchema
>;

export type UpdateSemesterInput = z.infer<
  typeof updateSemesterSchema
>;
