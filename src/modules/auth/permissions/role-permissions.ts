
import type { UserRole } from '../types/auth.types.js';
import type { Permission } from '../types/permission.types.js';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'school:manage',
    'school:view',
    'users:create',
    'users:view',
    'users:update',
    'users:delete',
    'analytics:view',
    'audit:view'
  ],

  SCHOOL_ADMIN: [
    'school:view',
    'users:create',
    'users:view',
    'users:update',
    'students:create',
    'students:view',
    'students:update',
    'students:delete',
    'admissions:manage',
    'enrollments:manage',
    'teachers:manage',
    'attendance:view',
    'examinations:manage',
    'marks:manage',
    'reports:view',
    'reports:generate',
    'timetables:manage',
    'notifications:manage',
    'announcements:manage',
    'analytics:view'
  ],

  PRINCIPAL: [
    'school:view',
    'students:view',
    'teachers:manage',
    'attendance:view',
    'examinations:manage',
    'marks:approve',
    'results:publish',
    'reports:view',
    'reports:generate',
    'timetables:manage',
    'announcements:manage',
    'analytics:view'
  ],

  VICE_PRINCIPAL: [
    'school:view',
    'students:view',
    'teachers:manage',
    'attendance:view',
    'examinations:manage',
    'marks:approve',
    'reports:view',
    'timetables:manage',
    'announcements:manage',
    'analytics:view'
  ],

  REGISTRAR: [
    'students:create',
    'students:view',
    'students:update',
    'admissions:manage',
    'enrollments:manage',
    'reports:view',
    'reports:generate'
  ],

  TEACHER: [
    'students:view',
    'attendance:manage',
    'attendance:view',
    'examinations:manage',
    'marks:manage',
    'reports:view',
    'timetables:manage'
  ],

  STUDENT: [
    'students:view',
    'attendance:view',
    'reports:view'
  ],

  PARENT: [
    'students:view',
    'attendance:view',
    'reports:view'
  ]
};
