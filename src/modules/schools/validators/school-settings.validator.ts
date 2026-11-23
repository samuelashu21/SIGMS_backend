
import { z } from 'zod';

export const updateSchoolSettingsSchema = z.object({
  academicYearStartMonth: z.number().int().min(1).max(13).optional(),
  weekStartsOn: z.number().int().min(0).max(6).optional(),
  attendanceCutoffTime: z.string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  requireMarksApproval: z.boolean().optional(),
  allowStudentResultAccess: z.boolean().optional(),
  allowParentResultAccess: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one setting must be provided.' }
);

export type UpdateSchoolSettingsPayload = z.infer<
  typeof updateSchoolSettingsSchema
>;
