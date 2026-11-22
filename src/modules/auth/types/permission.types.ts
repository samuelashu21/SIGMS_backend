export const PERMISSIONS = [
  // Existing permissions
  'school:manage',
  'school:view',
  'users:create',
  'users:view',
  'users:update',
  'users:delete',
  'students:create',
  'students:view',
  'students:update',
  'students:delete',
  'admissions:manage',
  'enrollments:manage',
  'teachers:manage',
  'attendance:manage',
  'attendance:view',
  'examinations:manage',
  'marks:manage',
  'marks:approve',
  'results:publish',
  'reports:view',
  'reports:generate',
  'timetables:manage',
  'notifications:manage',
  'announcements:manage',
  'analytics:view',
  'audit:view',

  // Role and permission management
  'roles:manage',
  'roles:view',
  'permissions:view',
  'permissions:manage'
] as const;

export type Permission = (typeof PERMISSIONS)[number];