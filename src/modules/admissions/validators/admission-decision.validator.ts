
import { z } from 'zod';

export const approveAdmissionSchema = z.object({
  decisionReason: z.string().trim().max(2000).optional()
});

export const rejectAdmissionSchema = z.object({
  decisionReason: z.string().trim().min(3).max(2000)
});

export type ApproveAdmissionInput = z.infer<
  typeof approveAdmissionSchema
>;

export type RejectAdmissionInput = z.infer<
  typeof rejectAdmissionSchema
>;
