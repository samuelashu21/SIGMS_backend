
import { z } from 'zod';

const dateSchema = z.iso.date();

export const createAcademicYearSchema = z.object({
  name: z.string().trim().min(3).max(100),
  startDate: dateSchema,
  endDate: dateSchema
}).refine(
  (data) => data.startDate < data.endDate,
  {
    message: 'End date must be after start date.',
    path: ['endDate']
  }
);

export const updateAcademicYearSchema = z.object({
  name: z.string().trim().min(3).max(100).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided.' }
);

export type CreateAcademicYearInput = z.infer<
  typeof createAcademicYearSchema
>;

export type UpdateAcademicYearInput = z.infer<
  typeof updateAcademicYearSchema
>;
