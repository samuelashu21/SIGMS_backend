
import { z } from 'zod';

export const createAdmissionApplicationSchema = z.object({
  applicantName: z.string().trim().min(2).max(150),
  dateOfBirth: z.iso.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  requestedGradeId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  notes: z.string().trim().max(2000).optional()
});

export const updateAdmissionApplicationSchema = z.object({
  applicantName: z.string().trim().min(2).max(150).optional(),
  dateOfBirth: z.iso.date().nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
  requestedGradeId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  notes: z.string().trim().max(2000).nullable().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one application field is required.' }
);

export const admissionApplicationQuerySchema = z.object({
  status: z.enum([
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'NEEDS_INFORMATION',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN'
  ]).optional(),
  academicYearId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  search: z.string().trim().max(150).optional()
});

export type CreateAdmissionApplicationInput = z.infer<
  typeof createAdmissionApplicationSchema
>;

export type UpdateAdmissionApplicationInput = z.infer<
  typeof updateAdmissionApplicationSchema
>;
