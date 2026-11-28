
import { z } from 'zod';

export const createAcademicCalendarEventSchema = z.object({
  academicYearId: z.string().uuid(),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(3000).optional(),
  eventType: z.enum([
    'ACADEMIC',
    'EXAMINATION',
    'REGISTRATION',
    'SCHOOL_ACTIVITY',
    'MEETING',
    'OTHER'
  ]),
  startDate: z.string().date(),
  endDate: z.string().date(),
  isAllDay: z.boolean().default(true),
  location: z.string().trim().max(200).optional()
}).superRefine((data, ctx) => {
  if (data.startDate > data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'Event end date cannot be before its start date.'
    });
  }
});

export const updateAcademicCalendarEventSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(3000).nullable().optional(),
  eventType: z.enum([
    'ACADEMIC',
    'EXAMINATION',
    'REGISTRATION',
    'SCHOOL_ACTIVITY',
    'MEETING',
    'OTHER'
  ]).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  isAllDay: z.boolean().optional(),
  location: z.string().trim().max(200).nullable().optional()
});

export const academicCalendarEventQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  eventType: z.enum([
    'ACADEMIC',
    'EXAMINATION',
    'REGISTRATION',
    'SCHOOL_ACTIVITY',
    'MEETING',
    'OTHER'
  ]).optional(),
  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50)
}).superRefine((data, ctx) => {
  if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['toDate'],
      message: 'End date cannot be before start date.'
    });
  }
});
