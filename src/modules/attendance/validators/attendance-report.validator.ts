
import { z } from 'zod';

export const attendanceReportQuerySchema = z.object({
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  academicYearId: z.string().uuid().optional()
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'Start date must not exceed end date.',
    path: ['endDate']
  }
);

export const sectionAttendanceReportQuerySchema =
  attendanceReportQuerySchema.extend({
    academicYearId: z.string().uuid()
  });
