
import { z } from 'zod';

export const updateStudentAttendanceSchema = z.object({
  status: z.enum([
    'PRESENT',
    'ABSENT',
    'LATE',
    'EXCUSED',
    'HALF_DAY'
  ]).optional(),

  arrivalTime: z.iso.datetime().nullable().optional(),

  remarks: z.string().trim().max(500).nullable().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one attendance field is required.' }
);

export const studentAttendanceQuerySchema = z.object({
  studentId: z.string().uuid(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
  academicYearId: z.string().uuid().optional(),
  status: z.enum([
    'PRESENT',
    'ABSENT',
    'LATE',
    'EXCUSED',
    'HALF_DAY'
  ]).optional()
});
