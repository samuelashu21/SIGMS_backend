
import { z } from 'zod';

export const createHomeroomAssignmentSchema = z.object({
  teacherId: z.string().uuid(),
  academicYearId: z.string().uuid()
});

export const updateHomeroomAssignmentSchema = z.object({
  teacherId: z.string().uuid()
});
