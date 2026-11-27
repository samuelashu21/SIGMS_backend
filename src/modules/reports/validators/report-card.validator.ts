import { z } from 'zod';

export const generateReportCardSchema = z.object({
  studentId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  periodType: z.enum(['SEMESTER', 'ANNUAL']),
  semesterId: z.string().uuid().optional()
}).superRefine((data, ctx) => {
  if (data.periodType === 'SEMESTER' && !data.semesterId) {
    ctx.addIssue({
      code: 'custom',
      path: ['semesterId'],
      message: 'Semester is required for semester reports.'
    });
  }

  if (data.periodType === 'ANNUAL' && data.semesterId) {
    ctx.addIssue({
      code: 'custom',
      path: ['semesterId'],
      message: 'Annual reports cannot specify a semester.'
    });
  }
});

export const updateReportCardRemarksSchema = z.object({
  teacherRemarks: z.string().max(3000).optional(),
  principalRemarks: z.string().max(3000).optional()
});

export const reportCardQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  periodType: z.enum(['SEMESTER', 'ANNUAL']).optional(),
  status: z.enum([
    'DRAFT',
    'GENERATED',
    'PUBLISHED',
    'WITHDRAWN'
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});