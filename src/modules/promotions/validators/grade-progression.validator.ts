
import { z } from 'zod';

export const createGradeProgressionRuleSchema = z.object({
  academicYearId: z.string().uuid(),
  currentGradeId: z.string().uuid(),
  nextGradeId: z.string().uuid().nullable().optional(),
  isGraduationGrade: z.boolean().default(false),
  description: z.string().trim().max(2000).optional()
}).superRefine((value, ctx) => {
  if (value.isGraduationGrade && value.nextGradeId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['nextGradeId'],
      message: 'A graduation grade cannot have a next grade.'
    });
  }

  if (!value.isGraduationGrade && !value.nextGradeId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['nextGradeId'],
      message: 'A next grade is required for a non-graduation grade.'
    });
  }

  if (
    value.nextGradeId &&
    value.nextGradeId === value.currentGradeId
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['nextGradeId'],
      message: 'A grade cannot progress to itself.'
    });
  }
});

export const updateGradeProgressionRuleSchema = z.object({
  nextGradeId: z.string().uuid().nullable().optional(),
  isGraduationGrade: z.boolean().optional(),
  isActive: z.boolean().optional(),
  description: z.string().trim().max(2000).optional()
});
