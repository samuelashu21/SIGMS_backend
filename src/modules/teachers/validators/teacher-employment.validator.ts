
import { z } from 'zod';

export const createTeacherEmploymentSchema = z.object({
  employeeNumber: z.string().trim().max(50).optional(),

  employmentType: z.enum([
    'PERMANENT',
    'CONTRACT',
    'TEMPORARY',
    'PART_TIME'
  ]),

  position: z.string().trim().min(2).max(150),
  department: z.string().trim().max(150).optional(),

  startDate: z.iso.date(),
  endDate: z.iso.date().optional(),

  notes: z.string().trim().max(2000).optional()
}).refine(
  (data) =>
    !data.endDate || data.endDate >= data.startDate,
  {
    path: ['endDate'],
    message: 'Employment end date cannot precede start date.'
  }
);

export const updateTeacherEmploymentSchema = z.object({
  employeeNumber: z.string().trim().max(50).nullable().optional(),

  employmentType: z.enum([
    'PERMANENT',
    'CONTRACT',
    'TEMPORARY',
    'PART_TIME'
  ]).optional(),

  position: z.string().trim().min(2).max(150).optional(),
  department: z.string().trim().max(150).nullable().optional(),

  endDate: z.iso.date().nullable().optional(),

  status: z.enum([
    'ACTIVE',
    'ON_LEAVE',
    'ENDED'
  ]).optional(),

  notes: z.string().trim().max(2000).nullable().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one employment field is required.'
  }
);

// Export inferred TypeScript input types.
export type CreateTeacherEmploymentInput =
  z.infer<typeof createTeacherEmploymentSchema>;

export type UpdateTeacherEmploymentInput =
  z.infer<typeof updateTeacherEmploymentSchema>;
