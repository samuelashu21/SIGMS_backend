
import { z } from 'zod';

export const createAcademicEnrollmentSchema = z.object({
  academicYearId: z.string().uuid(),
  enrollmentDate: z.iso.date().optional()
});

export type CreateAcademicEnrollmentInput = z.infer<
  typeof createAcademicEnrollmentSchema
>;
