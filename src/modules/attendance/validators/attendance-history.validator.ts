
import { z } from 'zod';

export const attendanceHistoryQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).refine(
  (data) =>
    !data.startDate ||
    !data.endDate ||
    data.startDate <= data.endDate,
  {
    path: ['endDate'],
    message: 'Start date must not exceed end date.'
  }
);
