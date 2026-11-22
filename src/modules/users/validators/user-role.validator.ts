
import { z } from 'zod';
import { USER_ROLES } from '../../auth/types/auth.types.js';

export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES)
});

export type UpdateUserRolePayload = z.infer<
  typeof updateUserRoleSchema
>;
