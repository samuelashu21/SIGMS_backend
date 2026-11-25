
import { z } from 'zod';

export const attendanceSummaryQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional()
}).refine(
  (data) =>
    !data.startDate ||
    !data.endDate ||
    data.startDate <= data.endDate,
  {
    message: 'Start date must not exceed end date.',
    path: ['endDate']
  }
);

export const classAttendanceSummaryQuerySchema =
  attendanceSummaryQuerySchema.extend({
    academicYearId: z.string().uuid()
  });
