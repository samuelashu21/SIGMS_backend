
import { createExaminationSchema } from './examination.validator.js';
import { z } from 'zod';

export const createQuizSchema = createExaminationSchema
  .omit({ type: true })
  .extend({
    durationMinutes: zNumber(1, 600),
    attemptsAllowed: zNumber(1, 20).default(1),
    shuffleQuestions: z.boolean().default(false),
    shuffleOptions: z.boolean().default(false),
    showResultsImmediately: z.boolean().default(false),
    allowReview: z.boolean().default(true),
    quizInstructions: z.string().trim().max(2000).optional()
  });

function zNumber(min: number, max: number) {
  return z.coerce.number().int().min(min).max(max);
}
