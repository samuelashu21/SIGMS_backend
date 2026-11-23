
import { z } from 'zod';

export const academicConfigurationSchema = z.object({
  termType: z.enum([
    'SEMESTER',
    'QUARTER',
    'TRIMESTER',
    'ANNUAL'
  ]).optional(),

  termsPerYear: z.number().int().min(1).max(4).optional(),

  passingPercentage: z.number().min(0).max(100).optional(),

  maximumScore: z.number().positive().max(10000).optional(),

  allowMarksCorrection: z.boolean().optional(),

  requireMarksApproval: z.boolean().optional(),

  allowIncompleteGrades: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one configuration field is required.' }
);

export type AcademicConfigurationInput = z.infer<
  typeof academicConfigurationSchema
>;
