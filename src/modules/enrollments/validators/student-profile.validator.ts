
import { z } from 'zod';

export const updateStudentProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(150).optional(),
  dateOfBirth: z.iso.date().nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),

  phoneNumber: z.string().trim().max(30).nullable().optional(),
  email: z.email().nullable().optional(),
  address: z.string().trim().max(300).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  region: z.string().trim().max(100).nullable().optional(),
  previousSchool: z.string().trim().max(200).nullable().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one profile field is required.' }
);

export type UpdateStudentProfileInput = z.infer<
  typeof updateStudentProfileSchema
>;
