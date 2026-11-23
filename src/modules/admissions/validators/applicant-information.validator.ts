
import { z } from 'zod';

export const applicantInformationSchema = z.object({
  phoneNumber: z.string().trim().max(30).optional(),
  email: z.email().optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  region: z.string().trim().max(100).optional(),
  previousSchool: z.string().trim().max(200).optional(),
  guardianName: z.string().trim().max(150).optional(),
  guardianRelation: z.string().trim().max(80).optional(),
  guardianPhone: z.string().trim().max(30).optional(),
  guardianEmail: z.email().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Provide at least one applicant information field.' }
);

export type ApplicantInformationInput = z.infer<
  typeof applicantInformationSchema
>;
