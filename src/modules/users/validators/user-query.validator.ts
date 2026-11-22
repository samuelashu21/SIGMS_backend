
import { z } from 'zod';
import { USER_ROLES } from '../../auth/types/auth.types.js';

export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  role: z.enum(USER_ROLES).optional(),
  isActive: z.enum(['true', 'false']).optional()
});

export type UserQuery = z.infer<typeof userQuerySchema>;
