
import { z } from 'zod';

const timeSchema = z.string().regex(
  /^([01]\d|2[0-3]):[0-5]\d$/,
  'Time must use HH:mm format.'
);

const periodSchema = z.object({
  periodNumber: z.number().int().min(1).max(30),
  label: z.string().trim().min(2).max(100),
  startsAt: timeSchema,
  endsAt: timeSchema,
  type: z.enum([
    'LESSON',
    'BREAK',
    'LUNCH',
    'ASSEMBLY',
    'OTHER'
  ]),
  isTeachingPeriod: z.boolean()
});

const validatePeriods = (
  periods: z.infer<typeof periodSchema>[],
  schoolStartTime: string,
  schoolEndTime: string
) => {
  const toMinutes = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start = toMinutes(schoolStartTime);
  const end = toMinutes(schoolEndTime);

  if (start >= end) {
    return false;
  }

  const sorted = [...periods].sort(
    (a, b) => a.periodNumber - b.periodNumber
  );

  const numbers = new Set<number>();

  for (let i = 0; i < sorted.length; i++) {
    const period = sorted[i];

    const periodStart = toMinutes(period.startsAt);
    const periodEnd = toMinutes(period.endsAt);

    if (
      numbers.has(period.periodNumber) ||
      periodStart >= periodEnd ||
      periodStart < start ||
      periodEnd > end
    ) {
      return false;
    }

    numbers.add(period.periodNumber);

    if (
      period.isTeachingPeriod !== (period.type === 'LESSON')
    ) {
      return false;
    }

    if (i > 0) {
      const previous = sorted[i - 1];

      if (toMinutes(previous.endsAt) > periodStart) {
        return false;
      }
    }
  }

  return true;
};

export const createTimetableConfigurationSchema = z.object({
  academicYearId: z.string().uuid(),
  name: z.string().trim().min(3).max(150),
  description: z.string().trim().max(2000).optional(),

  teachingDays: z.array(
    z.enum([
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY'
    ])
  ).min(1).max(7),

  schoolStartTime: timeSchema,
  schoolEndTime: timeSchema,

  allowTeacherDoubleBooking: z.boolean().default(false),
  allowSectionDoubleBooking: z.boolean().default(false),

  periods: z.array(periodSchema).min(1).max(30)
}).superRefine((data, ctx) => {
  if (new Set(data.teachingDays).size !== data.teachingDays.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['teachingDays'],
      message: 'Teaching days cannot contain duplicates.'
    });
  }

  if (
    !validatePeriods(
      data.periods,
      data.schoolStartTime,
      data.schoolEndTime
    )
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['periods'],
      message:
        'Periods must have unique numbers, valid times, no overlaps, and fit within school hours.'
    });
  }
});

export const updateTimetableConfigurationSchema = z.object({
  name: z.string().trim().min(3).max(150).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  teachingDays: z.array(
    z.enum([
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY'
    ])
  ).min(1).max(7).optional(),
  schoolStartTime: timeSchema.optional(),
  schoolEndTime: timeSchema.optional(),
  allowTeacherDoubleBooking: z.boolean().optional(),
  allowSectionDoubleBooking: z.boolean().optional(),
  isActive: z.boolean().optional(),
  periods: z.array(periodSchema).min(1).max(30).optional()
}).superRefine((data, ctx) => {
  if (
    data.teachingDays &&
    new Set(data.teachingDays).size !== data.teachingDays.length
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['teachingDays'],
      message: 'Teaching days cannot contain duplicates.'
    });
  }

  if (
    data.periods &&
    (!data.schoolStartTime || !data.schoolEndTime)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['periods'],
      message:
        'School opening and closing times are required when replacing periods.'
    });
  }

  if (
    data.periods &&
    data.schoolStartTime &&
    data.schoolEndTime &&
    !validatePeriods(
      data.periods,
      data.schoolStartTime,
      data.schoolEndTime
    )
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['periods'],
      message: 'Invalid or overlapping timetable periods.'
    });
  }
});
