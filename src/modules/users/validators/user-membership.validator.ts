
import { z } from 'zod';
import { USER_ROLES } from '../../auth/types/auth.types.js';

export const createMembershipSchema = z.object({
  schoolId: z.string().uuid(),
  role: z.enum(USER_ROLES)
});

export const membershipQuerySchema = z.object({
  schoolId: z.string().uuid().optional(),
  isActive: z.enum(['true', 'false']).optional()
});

export type CreateMembershipPayload = z.infer<
  typeof createMembershipSchema
>;
