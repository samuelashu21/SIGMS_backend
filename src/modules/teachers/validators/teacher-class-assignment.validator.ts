
import { z } from 'zod';

export const createTeacherClassAssignmentSchema = z.object({
  sectionId: z.string().uuid(),
  academicYearId: z.string().uuid()
});

export const updateTeacherClassAssignmentSchema = z.object({
  isActive: z.boolean()
});
