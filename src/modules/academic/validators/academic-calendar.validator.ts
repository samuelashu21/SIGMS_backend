
import { z } from 'zod';

export const createCalendarEventSchema = z.object({
  academicYearId: z.string().uuid(),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  eventType: z.enum([
    'TERM_START',
    'TERM_END',
    'SCHOOL_DAY',
    'HOLIDAY',
    'EXAMINATION',
    'REGISTRATION',
    'MEETING',
    'CULTURAL_EVENT',
    'OTHER'
  ]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isAllDay: z.boolean().default(true),
  location: z.string().trim().max(200).optional(),
  isPublished: z.boolean().default(false)
}).refine(
  (data) => data.startDate <= data.endDate,
  {
    message: 'End date cannot precede start date.',
    path: ['endDate']
  }
);

export const updateCalendarEventSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  eventType: z.enum([
    'TERM_START',
    'TERM_END',
    'SCHOOL_DAY',
    'HOLIDAY',
    'EXAMINATION',
    'REGISTRATION',
    'MEETING',
    'CULTURAL_EVENT',
    'OTHER'
  ]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isAllDay: z.boolean().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  isPublished: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one calendar event field is required.' }
);

export type CreateCalendarEventInput = z.infer<
  typeof createCalendarEventSchema
>;

export type UpdateCalendarEventInput = z.infer<
  typeof updateCalendarEventSchema
>;
