
import { z } from 'zod';
 


export const performanceHistoryQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  historyType: z.enum([
    'SUBJECT_GRADE',
    'SEMESTER_AVERAGE',
    'ANNUAL_AVERAGE',
    'PERFORMANCE_SUMMARY',
    'RANKING'
  ]).optional(),
  action: z.enum([
    'CREATED',
    'RECALCULATED',
    'CORRECTED',
    'PUBLISHED',
    'WITHDRAWN'
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
