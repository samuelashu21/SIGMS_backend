
import { z } from 'zod';

const gradeScaleSchema = z.object({
  letterGrade: z.string().trim().min(1).max(10),
  minimumScore: z.number().min(0).max(10000),
  maximumScore: z.number().min(0).max(10000),
  gradePoint: z.number().min(0).max(10).optional(),
  description: z.string().trim().max(200).optional(),
  isPassing: z.boolean().default(false)
}).refine(
  (data) => data.minimumScore <= data.maximumScore,
  {
    message: 'Minimum score cannot exceed maximum score.',
    path: ['maximumScore']
  }
);

export const createGradingSystemSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  isDefault: z.boolean().default(false),
  gradeScales: z.array(gradeScaleSchema).min(1).max(30)
});

export const updateGradingSystemSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one grading system field is required.' }
);

export const replaceGradeScalesSchema = z.object({
  gradeScales: z.array(gradeScaleSchema).min(1).max(30)
});

export type CreateGradingSystemInput = z.infer<
  typeof createGradingSystemSchema
>;

export type UpdateGradingSystemInput = z.infer<
  typeof updateGradingSystemSchema
>;
