
import { z } from 'zod';

export const createStudentGuardianSchema = z.object({
  studentId: z.string().uuid(),
  guardianId: z.string().uuid(),

  relationshipType: z.enum([
    'FATHER',
    'MOTHER',
    'GRANDFATHER',
    'GRANDMOTHER',
    'BROTHER',
    'SISTER',
    'UNCLE',
    'AUNT',
    'LEGAL_GUARDIAN',
    'OTHER'
  ]),

  isPrimary: z.boolean().default(false)
});
