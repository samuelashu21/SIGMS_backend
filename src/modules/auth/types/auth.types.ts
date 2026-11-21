export const USER_ROLES = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'REGISTRAR',
  'TEACHER',
  'STUDENT',
  'PARENT'
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthTokenPayload {
  sub: string;
  sessionId: string;
  role: UserRole;
  schoolId?: string;
  tokenType: 'access' | 'refresh';

  // JWT standard claims
  iat?: number;
  exp?: number;
}