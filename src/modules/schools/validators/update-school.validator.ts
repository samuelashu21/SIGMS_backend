
import { z } from 'zod';

export const updateSchoolSchema = z.object({
  name: z.string().trim().min(3).max(200).optional(),
  schoolType: z.enum([
    'ELEMENTARY',
    'SECONDARY',
    'PREPARATORY',
    'COMBINED'
  ]).optional(),
  region: z.string().trim().max(100).nullable().optional(),
  zone: z.string().trim().max(100).nullable().optional(),
  woreda: z.string().trim().max(100).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  address: z.string().trim().max(255).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  email: z.string().trim().email().max(255).nullable().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one school profile field is required.' }
);

export type UpdateSchoolPayload = z.infer<
  typeof updateSchoolSchema
>;
