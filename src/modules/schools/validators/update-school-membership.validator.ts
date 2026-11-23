
import { z } from 'zod';
import { USER_ROLES } from '../../auth/types/auth.types.js';

export const updateSchoolMembershipSchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one membership field is required.' }
);

export type UpdateSchoolMembershipPayload = z.infer<
  typeof updateSchoolMembershipSchema
>;
