
import { z } from 'zod';

export const generateAttendanceReportSchema = z.object({
  academicYearId: z.string().uuid(),
  scope: z.enum(['STUDENT', 'SECTION']),
  studentId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date()
}).superRefine((data, ctx) => {
  if (data.startDate > data.endDate) {
    ctx.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'End date must be after start date.'
    });
  }

  if (data.scope === 'STUDENT' && !data.studentId) {
    ctx.addIssue({
      code: 'custom',
      path: ['studentId'],
      message: 'Student ID is required for student reports.'
    });
  }

  if (data.scope === 'SECTION' && !data.sectionId) {
    ctx.addIssue({
      code: 'custom',
      path: ['sectionId'],
      message: 'Section ID is required for section reports.'
    });
  }
});

export const attendanceReportQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
