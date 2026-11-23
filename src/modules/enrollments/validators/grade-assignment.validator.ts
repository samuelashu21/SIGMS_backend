
import { z } from 'zod';

export const gradeAssignmentSchema = z.object({
  gradeId: z.string().uuid()
});

export type GradeAssignmentInput = z.infer<
  typeof gradeAssignmentSchema
>;
