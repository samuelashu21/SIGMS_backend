
import { z } from 'zod';

export const userStatusSchema = z.object({
  isActive: z.boolean()
});

export type UserStatusPayload = z.infer<
  typeof userStatusSchema
>;
