
import { z } from 'zod';

export const scheduleExaminationSchema = z.object({
  examinationDate: z.iso.date(),
  startTime: z.string().regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    'Start time must use HH:mm format.'
  ),
  endTime: z.string().regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    'End time must use HH:mm format.'
  ),
  room: z.string().trim().min(1).max(100),
  instructions: z.string().trim().max(2000).optional()
}).refine(
  (data) => data.startTime < data.endTime,
  {
    path: ['endTime'],
    message: 'End time must be later than start time.'
  }
);
