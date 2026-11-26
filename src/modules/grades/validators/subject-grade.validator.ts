
import { z } from 'zod';

export const calculateSubjectGradeSchema = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  semesterId: z.string().uuid()
});

export const getSubjectGradeQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
