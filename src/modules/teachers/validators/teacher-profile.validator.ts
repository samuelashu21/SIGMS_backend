
import { z } from 'zod';

export const createTeacherProfileSchema = z.object({
  userId: z.string().uuid(),

  firstName: z.string().trim().min(2).max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(2).max(100),

  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.iso.date().optional(),

  phoneNumber: z.string().trim().max(30).optional(),
  email: z.email().optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  region: z.string().trim().max(100).optional()
});

export const updateTeacherProfileSchema =
  createTeacherProfileSchema
    .omit({ userId: true })
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: 'At least one profile field is required.' }
    );

export type CreateTeacherProfileInput = z.infer<
  typeof createTeacherProfileSchema
>;

export type UpdateTeacherProfileInput = z.infer<
  typeof updateTeacherProfileSchema
>;
