
import type { UserRole } from '../../auth/types/auth.types.js';

export type SchoolMembershipRole = Exclude<
  UserRole,
  'SUPER_ADMIN'
>;

export interface SchoolContext {
  schoolId: string;
  userId: string;
  role: UserRole;
}
