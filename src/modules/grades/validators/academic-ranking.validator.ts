
import { z } from 'zod';

export const rankingConfigurationSchema = z.object({
  academicYearId: z.string().uuid(),
  gradeId: z.string().uuid(),
  rankingEnabled: z.boolean(),
  rankingScope: z.enum(['GRADE', 'SECTION']).default('GRADE'),
  allowStudentVisibility: z.boolean().default(false),
  allowParentVisibility: z.boolean().default(false),
  minimumStudents: z.number().int().min(2).max(500).default(2),
  includeTies: z.boolean().default(true)
});

export const calculateRankingSchema = z.object({
  academicYearId: z.string().uuid(),
  gradeId: z.string().uuid(),
  period: z.enum(['SEMESTER', 'ANNUAL']),
  semesterId: z.string().uuid().optional()
}).superRefine((data, ctx) => {
  if (data.period === 'SEMESTER' && !data.semesterId) {
    ctx.addIssue({
      code: 'custom',
      path: ['semesterId'],
      message: 'Semester is required for semester rankings.'
    });
  }

  if (data.period === 'ANNUAL' && data.semesterId) {
    ctx.addIssue({
      code: 'custom',
      path: ['semesterId'],
      message: 'Annual rankings cannot specify a semester.'
    });
  }
});

export const rankingQuerySchema = z.object({
  academicYearId: z.string().uuid(),
  gradeId: z.string().uuid(),
  period: z.enum(['SEMESTER', 'ANNUAL']),
  semesterId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
