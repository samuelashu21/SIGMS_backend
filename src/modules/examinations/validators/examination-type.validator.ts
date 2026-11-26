
import { z } from 'zod';

export const createExaminationTypeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(2).max(30)
    .regex(/^[A-Z0-9_]+$/),
  description: z.string().trim().max(500).optional(),
  isDefault: z.boolean().default(false)
});

export const updateExaminationTypeSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional()
});
