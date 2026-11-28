
import { z } from 'zod';

export const generateExaminationReportSchema = z.object({
  examinationId: z.string().uuid(),
  scope: z.enum([
    'EXAMINATION',
    'STUDENT',
    'SECTION',
    'SUBJECT'
  ]),
  studentId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional()
}).superRefine((data, ctx) => {
  if (data.scope === 'STUDENT' && !data.studentId) {
    ctx.addIssue({
      code: 'custom',
      path: ['studentId'],
      message: 'Student ID is required.'
    });
  }

  if (data.scope === 'SECTION' && !data.sectionId) {
    ctx.addIssue({
      code: 'custom',
      path: ['sectionId'],
      message: 'Section ID is required.'
    });
  }

  if (data.scope === 'SUBJECT' && !data.subjectId) {
    ctx.addIssue({
      code: 'custom',
      path: ['subjectId'],
      message: 'Subject ID is required.'
    });
  }
});

export const examinationReportQuerySchema = z.object({
  examinationId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
