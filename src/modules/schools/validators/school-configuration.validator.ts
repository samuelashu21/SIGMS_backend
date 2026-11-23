
import { z } from 'zod';

export const updateSchoolConfigurationSchema = z.object({
  defaultLanguage: z.enum(['ENGLISH', 'AMHARIC']).optional(),
  calendarType: z.enum(['GREGORIAN', 'ETHIOPIAN']).optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
  academicYearLabel: z.enum(['GREGORIAN', 'ETHIOPIAN']).optional(),
  attendanceEnabled: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  parentAccessEnabled: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one configuration field is required.' }
);

export type UpdateSchoolConfigurationPayload = z.infer<
  typeof updateSchoolConfigurationSchema
>;
