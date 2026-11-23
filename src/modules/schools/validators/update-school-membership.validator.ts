
import { z } from 'zod';

const SCHOOL_MEMBERSHIP_ROLES = [
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'REGISTRAR',
  'TEACHER',
  'STUDENT',
  'PARENT'
] as const;

export const updateSchoolMembershipSchema = z.object({
  role: z.enum(SCHOOL_MEMBERSHIP_ROLES).optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one membership field is required.' }
);

export type UpdateSchoolMembershipPayload = z.infer<
  typeof updateSchoolMembershipSchema
>;
