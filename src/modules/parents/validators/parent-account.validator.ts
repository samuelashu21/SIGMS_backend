
import { z } from 'zod';

export const createParentAccountSchema = z.object({
  email: z.email().optional(),
  username: z.string().trim().min(3).max(50).optional(),
  password: z.string().min(8).max(128)
}).refine(
  (data) => data.email || data.username,
  { message: 'Email or username is required.' }
);
