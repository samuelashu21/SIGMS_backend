
import { z } from 'zod';

export const createTeacherWorkloadSchema = z.object({
  academicYearId: z.string().uuid(),

  workloadType: z.enum([
    'TEACHING',
    'HOMEROOM',
    'ADMINISTRATIVE',
    'EXTRACURRICULAR',
    'OTHER'
  ]),

  description: z.string().trim().min(2).max(500),
  weeklyPeriods: z.number().int().min(1).max(100),

  effectiveFrom: z.iso.date(),
  effectiveTo: z.iso.date().optional()
}).refine(
  (data) =>
    !data.effectiveTo ||
    data.effectiveTo >= data.effectiveFrom,
  {
    path: ['effectiveTo'],
    message: 'Effective end date cannot precede start date.'
  }
);

export const updateTeacherWorkloadSchema = z.object({
  workloadType: z.enum([
    'TEACHING',
    'HOMEROOM',
    'ADMINISTRATIVE',
    'EXTRACURRICULAR',
    'OTHER'
  ]).optional(),

  description: z.string().trim().min(2).max(500).optional(),
  weeklyPeriods: z.number().int().min(1).max(100).optional(),
  effectiveTo: z.iso.date().nullable().optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one workload field is required.' }
);
