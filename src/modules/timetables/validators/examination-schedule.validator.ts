
import { z } from 'zod';

const timeSchema = z.string().regex(
  /^([01]\d|2[0-3]):[0-5]\d$/,
  'Time must use HH:mm format.'
);

export const scheduleExaminationSchema = z.object({
  examinationDate: z.string().date(),
  startTime: timeSchema,
  endTime: timeSchema,
  room: z.string().trim().min(1).max(100).optional(),
  instructions: z.string().trim().max(3000).optional()
}).superRefine((data, ctx) => {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  if (toMinutes(data.startTime) >= toMinutes(data.endTime)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endTime'],
      message: 'Examination end time must be after its start time.'
    });
  }
});

export const examinationScheduleQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  examinationDate: z.string().date().optional(),
  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).superRefine((data, ctx) => {
  if (
    data.fromDate &&
    data.toDate &&
    data.fromDate > data.toDate
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['toDate'],
      message: 'End date cannot be before start date.'
    });
  }
});
