
import { z } from 'zod';
import { SCHOOL_TYPES } from '../types/school.types.js';

export const createSchoolSchema = z.object({
  name: z.string().trim().min(3).max(200),

  schoolCode: z.string()
    .trim()
    .min(2)
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/),

  schoolType: z.enum(SCHOOL_TYPES),

  region: z.string().trim().max(100).optional(),
  zone: z.string().trim().max(100).optional(),
  woreda: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  address: z.string().trim().max(255).optional(),

  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(255).optional()
});

export type CreateSchoolPayload = z.infer<
  typeof createSchoolSchema
>;
