
import { z } from 'zod';

export const studentRegistrationSchema = z.object({
  applicationId: z.string().uuid()
});

export type StudentRegistrationInput = z.infer<
  typeof studentRegistrationSchema
>;
