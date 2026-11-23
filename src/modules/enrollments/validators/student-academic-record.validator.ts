
import { z } from 'zod';

export const createStudentAcademicRecordSchema = z.object({
  enrollmentId: z.string().uuid().optional(),
  recordType: z.enum([
    'ACADEMIC_ACHIEVEMENT',
    'ACADEMIC_MILESTONE',
    'PERFORMANCE_REMARK',
    'TEACHER_REMARK',
    'GENERAL_ACADEMIC_NOTE'
  ]),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(3).max(3000),
  subjectName: z.string().trim().max(150).optional(),
  recordDate: z.iso.date()
});

export type CreateStudentAcademicRecordInput = z.infer<
  typeof createStudentAcademicRecordSchema
>;
