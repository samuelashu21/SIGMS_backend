
import { z } from 'zod';

export const generatePerformanceSummarySchema = z.object({
  studentId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  summaryType: z.enum(['SEMESTER', 'ANNUAL']),
  semesterId: z.string().uuid().optional()
}).superRefine((data, ctx) => {
  if (data.summaryType === 'SEMESTER' && !data.semesterId) {
    ctx.addIssue({
      code: 'custom',
      path: ['semesterId'],
      message: 'Semester is required for a semester summary.'
    });
  }

  if (data.summaryType === 'ANNUAL' && data.semesterId) {
    ctx.addIssue({
      code: 'custom',
      path: ['semesterId'],
      message: 'Annual summaries must not specify a semester.'
    });
  }
});

export const performanceSummaryQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  summaryType: z.enum(['SEMESTER', 'ANNUAL']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
