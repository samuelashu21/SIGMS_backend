
import { z } from 'zod';

const percentageSchema = z.number().min(0).max(100);

export const createPromotionConfigurationSchema = z.object({
  academicYearId: z.string().uuid(),
  name: z.string().trim().min(3).max(150),

  decisionType: z.enum([
    'AUTOMATIC_ELIGIBILITY',
    'MANUAL_REVIEW',
    'EXAMINATION_BASED',
    'PERFORMANCE_BASED'
  ]),

  minimumOverallPercentage: percentageSchema.optional(),
  minimumGradePoint: z.number().min(0).max(5).optional(),
  minimumAttendancePercentage: percentageSchema.optional(),

  minimumPassedSubjects: z.number().int().min(0).default(0),
  maximumFailedSubjects: z.number().int().min(0).default(0),

  requireAllCoreSubjectsPassed: z.boolean().default(true),
  requireCompletedExaminations: z.boolean().default(true),
  requireApprovedResults: z.boolean().default(true),

  allowManualOverride: z.boolean().default(false),
  requirePrincipalApproval: z.boolean().default(true),

  gradeRules: z.array(
    z.object({
      gradeId: z.string().uuid(),
      minimumOverallPercentage: percentageSchema.optional(),
      minimumGradePoint: z.number().min(0).max(5).optional(),
      minimumAttendancePercentage: percentageSchema.optional(),
      minimumPassedSubjects: z.number().int().min(0).optional(),
      maximumFailedSubjects: z.number().int().min(0).optional(),
      requireAllCoreSubjectsPassed: z.boolean().optional(),
      allowPromotion: z.boolean().default(true)
    })
  ).min(1)
});

export const updatePromotionConfigurationSchema =
  createPromotionConfigurationSchema.partial().omit({
    academicYearId: true,
    gradeRules: true
  }).extend({
    name: z.string().trim().min(3).max(150).optional()
  });
