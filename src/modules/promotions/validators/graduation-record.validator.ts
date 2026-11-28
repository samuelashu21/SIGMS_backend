
import { z } from 'zod';

export const createGraduationRecordSchema = z.object({
  candidateId: z.string().uuid(),
  graduationDate: z.coerce.date(),
  graduationNumber: z.string().trim().min(3).max(100),
  qualification: z.string().trim().max(200).optional(),
  distinction: z.string().trim().max(150).optional(),
  remarks: z.string().trim().max(3000).optional()
});

export const revokeGraduationRecordSchema = z.object({
  reason: z.string().trim().min(10).max(3000)
});
