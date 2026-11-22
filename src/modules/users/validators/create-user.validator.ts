
import { z } from 'zod';
import { USER_ROLES } from '../../auth/types/auth.types.js';
import { passwordSchema } from '../../auth/validators/password.validator.js';

export const createUserSchema = z.object({
  email: z.string().trim().email().max(255).optional(),
  username: z.string().trim().min(3).max(50).optional(),
  password: passwordSchema,
  role: z.enum(USER_ROLES)
}).refine(
  (data) => Boolean(data.email || data.username),
  {
    message: 'An email address or username is required.'
  }
);

export type CreateUserPayload = z.infer<typeof createUserSchema>;
