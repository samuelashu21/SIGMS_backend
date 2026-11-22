
import { z } from 'zod';
import { USER_ROLES } from '../../auth/types/auth.types.js';

export const updateUserSchema = z.object({
  email: z.string().trim().email().max(255).nullable().optional(),
  username: z.string().trim().min(3).max(50).nullable().optional(),
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided.'
  }
);

export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
