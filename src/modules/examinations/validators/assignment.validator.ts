
import { z } from 'zod';
import { createExaminationSchema } from './examination.validator.js';

export const createAssignmentSchema = createExaminationSchema
  .omit({ type: true })
  .extend({
    dueDate: z.iso.date(),
    dueTime: z.string().regex(
      /^([01]\d|2[0-3]):[0-5]\d$/
    ).optional(),
    allowLateSubmission: z.boolean().default(false),
    latePenaltyPercent: z.coerce.number()
      .min(0)
      .max(100)
      .nullable()
      .optional(),
    attemptsAllowed: z.coerce.number()
      .int()
      .min(1)
      .max(20)
      .default(1),
    attachmentRequired: z.boolean().default(false),
    submissionInstructions: z.string()
      .trim()
      .max(2000)
      .optional()
  }).refine(
    (data) =>
      data.allowLateSubmission ||
      data.latePenaltyPercent == null,
    {
      path: ['latePenaltyPercent'],
      message: 'A late penalty requires late submissions to be enabled.'
    }
  );
