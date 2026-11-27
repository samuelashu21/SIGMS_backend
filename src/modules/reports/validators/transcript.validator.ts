
import { z } from 'zod';

export const generateTranscriptSchema = z.object({
  studentId: z.string().uuid()
});

export const transcriptQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  status: z.enum([
    'DRAFT',
    'GENERATED',
    'PUBLISHED',
    'WITHDRAWN'
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
