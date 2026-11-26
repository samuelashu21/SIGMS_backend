
import { z } from 'zod';

export const createExaminationGradingSchema = z.object({
  gradingMethod: z.enum([
    'NUMERIC',
    'PERCENTAGE',
    'LETTER_GRADE',
    'PASS_FAIL'
  ]).default('NUMERIC'),

  maximumMarks: z.coerce.number().positive().max(100000),
  passingMarks: z.coerce.number().min(0),

  decimalPlaces: z.coerce.number().int().min(0).max(4).default(2),

  roundingMode: z.enum([
    'ROUND',
    'ROUND_UP',
    'ROUND_DOWN'
  ]).default('ROUND'),

  allowNegativeMarks: z.boolean().default(false),
  negativeMarkValue: z.coerce.number().positive().nullable().optional(),

  allowBonusMarks: z.boolean().default(false),
  maximumBonusMarks: z.coerce.number().positive().nullable().optional()
}).refine(
  (data) => data.passingMarks <= data.maximumMarks,
  {
    path: ['passingMarks'],
    message: 'Passing marks cannot exceed maximum marks.'
  }
).refine(
  (data) =>
    data.allowNegativeMarks ||
    data.negativeMarkValue == null,
  {
    path: ['negativeMarkValue'],
    message: 'Negative marking must be enabled to configure a penalty.'
  }
).refine(
  (data) =>
    data.allowBonusMarks ||
    data.maximumBonusMarks == null,
  {
    path: ['maximumBonusMarks'],
    message: 'Bonus marks must be enabled to configure a bonus limit.'
  }
);

export const updateExaminationGradingSchema =
  createExaminationGradingSchema.partial();
