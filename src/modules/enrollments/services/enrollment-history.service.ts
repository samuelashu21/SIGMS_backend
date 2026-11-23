
import type {
  Prisma,
  EnrollmentHistoryAction,
  AcademicEnrollmentStatus
} from '../../../generated/prisma/client.js';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';


export interface RecordEnrollmentHistoryInput {
  schoolId: string;
  enrollmentId: string;
  changedById?: string;
  action: EnrollmentHistoryAction;
  previousGradeId?: string | null;
  newGradeId?: string | null;
  previousSectionId?: string | null;
  newSectionId?: string | null;
  previousStatus?: AcademicEnrollmentStatus | null;
  newStatus?: AcademicEnrollmentStatus | null;
  reason?: string | null;
}

export const recordEnrollmentHistory = async (
  tx: Prisma.TransactionClient,
  input: RecordEnrollmentHistoryInput
) => {
  return tx.enrollmentHistory.create({
    data: {
      ...input,
      changedById: input.changedById ?? null,
      previousGradeId: input.previousGradeId ?? null,
      newGradeId: input.newGradeId ?? null,
      previousSectionId: input.previousSectionId ?? null,
      newSectionId: input.newSectionId ?? null,
      previousStatus: input.previousStatus ?? null,
      newStatus: input.newStatus ?? null,
      reason: input.reason ?? null
    }
  });
};



export const getEnrollmentHistory = async (
  schoolId: string,
  enrollmentId: string
) => {
  const enrollment = await prisma.academicEnrollment.findFirst({
    where: {
      id: enrollmentId,
      schoolId
    },
    select: { id: true }
  });

  if (!enrollment) {
    throw new AppError('Academic enrollment not found.', 404);
  }

  return prisma.enrollmentHistory.findMany({
    where: {
      enrollmentId,
      schoolId
    },
    include: {
      changedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      changedAt: 'desc'
    }
  });
};