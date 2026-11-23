
import { z } from 'zod';
import { passwordSchema } from '../../auth/validators/password.validator.js';

export const createStudentAccountSchema = z.object({
  email: z.string().trim().email().max(255).optional(),
  username: z.string().trim().min(3).max(50).optional(),
  password: passwordSchema
}).refine(
  (data) => Boolean(data.email || data.username),
  { message: 'Email or username is required.' }
);

export type CreateStudentAccountPayload = z.infer<
  typeof createStudentAccountSchema
>;
