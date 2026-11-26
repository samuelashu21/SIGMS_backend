
import { z } from 'zod';

export const createExaminationSchema = z.object({
  academicYearId: z.string().uuid(),
  semesterId: z.string().uuid().optional().nullable(),
  gradeId: z.string().uuid(),
  sectionId: z.string().uuid().optional().nullable(),
  subjectId: z.string().uuid(),

  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),

  type: z.enum([
    'QUIZ',
    'TEST',
    'MIDTERM',
    'FINAL',
    'MOCK',
    'NATIONAL',
    'CONTINUOUS_ASSESSMENT',
    'OTHER'
  ]),

  mode: z.enum([
    'WRITTEN',
    'ORAL',
    'PRACTICAL',
    'ONLINE',
    'MIXED'
  ]).default('WRITTEN'),

  totalMarks: z.coerce.number().positive().max(100000),
  passingMarks: z.coerce.number().min(0).optional().nullable(),
  weight: z.coerce.number().min(0).max(100).optional().nullable(),

  instructions: z.string().trim().max(2000).optional()
}).refine(
  (data) =>
    data.passingMarks === undefined ||
    data.passingMarks === null ||
    data.passingMarks <= data.totalMarks,
  {
    path: ['passingMarks'],
    message: 'Passing marks cannot exceed total marks.'
  }
);

export const updateExaminationSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  totalMarks: z.coerce.number().positive().max(100000).optional(),
  passingMarks: z.coerce.number().min(0).nullable().optional(),
  weight: z.coerce.number().min(0).max(100).nullable().optional(),
  instructions: z.string().trim().max(2000).nullable().optional()
});

export const examinationListQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  semesterId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  type: z.enum([
    'QUIZ',
    'TEST',
    'MIDTERM',
    'FINAL',
    'MOCK',
    'NATIONAL',
    'CONTINUOUS_ASSESSMENT',
    'OTHER'
  ]).optional(),
  status: z.enum([
    'DRAFT',
    'SCHEDULED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED'
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
