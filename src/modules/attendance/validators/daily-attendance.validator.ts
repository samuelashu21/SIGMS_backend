
import { z } from 'zod';

export const createDailyAttendanceSchema = z.object({
  sectionId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  attendanceDate: z.iso.date(),
  session: z.enum([
    'MORNING',
    'AFTERNOON',
    'FULL_DAY'
  ]).default('FULL_DAY'),
  remarks: z.string().trim().max(1000).optional(),

  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum([
        'PRESENT',
        'ABSENT',
        'LATE',
        'EXCUSED',
        'HALF_DAY'
      ]),
      arrivalTime: z.iso.datetime().optional(),
      remarks: z.string().trim().max(500).optional()
    })
  ).min(1)
});
