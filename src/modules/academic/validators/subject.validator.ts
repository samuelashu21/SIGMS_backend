
import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/),
  description: z.string().trim().max(500).optional()
});

export const updateSubjectSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  code: z.string()
    .trim()
    .min(2)
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/)
    .optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one subject field is required.' }
);

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
