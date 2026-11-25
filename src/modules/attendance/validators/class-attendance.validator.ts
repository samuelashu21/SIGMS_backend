
import { z } from 'zod';

export const updateClassAttendanceSchema = z.object({
  remarks: z.string().trim().max(1000).nullable().optional(),
  session: z.enum([
    'MORNING',
    'AFTERNOON',
    'FULL_DAY'
  ]).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required.' }
);

export const classAttendanceQuerySchema = z.object({
  date: z.iso.date().optional(),
  academicYearId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  session: z.enum([
    'MORNING',
    'AFTERNOON',
    'FULL_DAY'
  ]).optional(),
  status: z.enum([
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
  ]).optional()
});
