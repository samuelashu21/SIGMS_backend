
import { z } from 'zod';

export const createTeacherQualificationSchema = z.object({
  qualificationType: z.enum([
    'CERTIFICATE',
    'DIPLOMA',
    'BACHELORS',
    'MASTERS',
    'DOCTORATE',
    'PROFESSIONAL_CERTIFICATION',
    'OTHER'
  ]),
  title: z.string().trim().min(2).max(200),
  institution: z.string().trim().min(2).max(200),
  fieldOfStudy: z.string().trim().max(150).optional(),
  country: z.string().trim().max(100).optional(),
  graduationYear: z.number().int().min(1950).max(2100).optional(),
  certificateNumber: z.string().trim().max(100).optional(),
  documentPath: z.string().trim().max(500).optional(),
  description: z.string().trim().max(2000).optional()
});

export const updateTeacherQualificationSchema =
  createTeacherQualificationSchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: 'At least one qualification field is required.' }
    );
