
import { z } from 'zod';

export const calculateAnnualAverageSchema = z.object({
  studentId: z.string().uuid(),
  academicYearId: z.string().uuid()
});

export const annualAverageQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
