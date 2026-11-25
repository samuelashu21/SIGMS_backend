
import { z } from 'zod';

export const createAttendanceCorrectionSchema = z.object({
  attendanceRecordId: z.string().uuid(),

  requestedStatus: z.enum([
    'PRESENT',
    'ABSENT',
    'LATE',
    'EXCUSED',
    'HALF_DAY'
  ]),

  reason: z.string().trim().min(5).max(1000)
});

export const reviewAttendanceCorrectionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().trim().max(1000).optional()
}).refine(
  (data) =>
    data.decision !== 'REJECTED' ||
    Boolean(data.reviewNotes?.trim()),
  {
    path: ['reviewNotes'],
    message: 'A reason is required when rejecting a correction.'
  }
);
