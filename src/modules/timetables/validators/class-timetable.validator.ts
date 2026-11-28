
import { z } from 'zod';

export const createClassTimetableSchema = z.object({
  configurationId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  sectionId: z.string().uuid(),
  name: z.string().trim().min(3).max(150),
  effectiveFrom: z.string().date().optional(),
  effectiveUntil: z.string().date().optional(),
  entries: z.array(
    z.object({
      periodId: z.string().uuid(),
      day: z.enum([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY'
      ]),
      subjectId: z.string().uuid(),
      teacherProfileId: z.string().uuid(),
      roomLabel: z.string().trim().max(100).optional(),
      notes: z.string().trim().max(1000).optional()
    })
  ).min(1).max(300)
}).superRefine((data, ctx) => {
  if (
    data.effectiveFrom &&
    data.effectiveUntil &&
    data.effectiveFrom > data.effectiveUntil
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['effectiveUntil'],
      message: 'The end date must not be before the start date.'
    });
  }

  const combinations = new Set<string>();

  data.entries.forEach((entry, index) => {
    const key = `${entry.day}:${entry.periodId}`;

    if (combinations.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['entries', index, 'periodId'],
        message: 'A section cannot have two entries in the same period.'
      });
    }

    combinations.add(key);
  });
});

export const classTimetableQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
