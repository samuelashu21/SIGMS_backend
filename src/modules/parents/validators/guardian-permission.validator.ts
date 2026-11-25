
import { z } from 'zod';

export const updateGuardianPermissionSchema = z.object({
  canViewAcademicRecords: z.boolean().optional(),
  canViewAttendance: z.boolean().optional(),
  canViewExamResults: z.boolean().optional(),
  canViewReportCards: z.boolean().optional(),
  canViewTimetable: z.boolean().optional(),
  canViewAnnouncements: z.boolean().optional(),
  canReceiveNotifications: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one permission must be provided.' }
);
