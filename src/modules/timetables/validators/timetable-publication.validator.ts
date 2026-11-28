
import { z } from 'zod';

export const submitTimetableSchema = z.object({
  remarks: z.string().trim().max(3000).optional()
});

export const approveTimetableSchema = z.object({
  remarks: z.string().trim().max(3000).optional()
});

export const publishTimetableSchema = z.object({
  remarks: z.string().trim().max(3000).optional()
});
