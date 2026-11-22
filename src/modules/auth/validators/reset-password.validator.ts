
import { z } from 'zod';
import { passwordSchema } from './password.validator.js';

export const resetPasswordSchema = z.object({
  token: z.string().length(64),
  newPassword: passwordSchema
});
