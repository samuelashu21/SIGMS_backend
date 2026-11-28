
import { z } from 'zod';

export const teacherTimetableQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  teacherProfileId: z.string().uuid().optional(),
  day: z.enum([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
  ]).optional(),
  includeDrafts: z.coerce.boolean().default(false)
});
