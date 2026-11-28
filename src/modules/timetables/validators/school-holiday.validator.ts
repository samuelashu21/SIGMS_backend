
import { z } from 'zod';

export const createSchoolHolidaySchema = z.object({
  academicYearId: z.string().uuid(),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  type: z.enum([
    'PUBLIC_HOLIDAY',
    'RELIGIOUS_HOLIDAY',
    'SCHOOL_BREAK',
    'EMERGENCY_CLOSURE',
    'OTHER'
  ]),
  startDate: z.string().date(),
  endDate: z.string().date(),
  isRecurring: z.boolean().default(false)
}).superRefine((data, ctx) => {
  if (data.startDate > data.endDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: 'Holiday end date cannot be before its start date.'
    });
  }
});

export const updateSchoolHolidaySchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  type: z.enum([
    'PUBLIC_HOLIDAY',
    'RELIGIOUS_HOLIDAY',
    'SCHOOL_BREAK',
    'EMERGENCY_CLOSURE',
    'OTHER'
  ]).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  isRecurring: z.boolean().optional(),
  isActive: z.boolean().optional()
});

export const schoolHolidayQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  type: z.enum([
    'PUBLIC_HOLIDAY',
    'RELIGIOUS_HOLIDAY',
    'SCHOOL_BREAK',
    'EMERGENCY_CLOSURE',
    'OTHER'
  ]).optional(),
  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).superRefine((data, ctx) => {
  if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['toDate'],
      message: 'End date cannot be before start date.'
    });
  }
});
