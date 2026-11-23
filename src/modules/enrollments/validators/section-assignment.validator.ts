
import { z } from 'zod';

export const sectionAssignmentSchema = z.object({
  sectionId: z.string().uuid()
});

export type SectionAssignmentInput = z.infer<
  typeof sectionAssignmentSchema
>;
