
import type { Prisma } from '../../../generated/prisma/client.js';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type ProgressionHistoryInput = {
  schoolId: string;
  studentId: string;
  currentEnrollmentId?: string;
  previousEnrollmentId?: string;
  academicYearId: string;
  previousGradeId?: string;
  newGradeId?: string;
  previousSectionId?: string;
  newSectionId?: string;
  action:
    | 'ENROLLED'
    | 'PROMOTED'
    | 'RETAINED'
    | 'GRADUATED'
    | 'CORRECTED';
  reason?: string;
  details?: Prisma.InputJsonValue;
  performedById: string;
};

export const recordAcademicProgression = async (
  tx: Prisma.TransactionClient,
  input: ProgressionHistoryInput
) => {
  return tx.academicProgressionHistory.create({
    data: {
      schoolId: input.schoolId,
      studentId: input.studentId,
      currentEnrollmentId: input.currentEnrollmentId,
      previousEnrollmentId: input.previousEnrollmentId,
      academicYearId: input.academicYearId,
      previousGradeId: input.previousGradeId,
      newGradeId: input.newGradeId,
      previousSectionId: input.previousSectionId,
      newSectionId: input.newSectionId,
      action: input.action,
      reason: input.reason,
      details: input.details,
      performedById: input.performedById
    }
  });
};

export const getStudentAcademicProgressionHistory = async (
  schoolId: string,
  studentId: string
) => {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      schoolId
    },
    select: { id: true }
  });

  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  return prisma.academicProgressionHistory.findMany({
    where: {
      schoolId,
      studentId
    },
    include: {
      academicYear: true,
      previousGrade: true,
      newGrade: true,
      previousSection: true,
      newSection: true,
      currentEnrollment: true,
      previousEnrollment: true,
      performedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      performedAt: 'desc'
    }
  });
};

export const getSchoolAcademicProgressionHistory = async (
  schoolId: string,
  input: {
    academicYearId?: string;
    action?: ProgressionHistoryInput['action'];
    page?: number;
    limit?: number;
  }
) => {
  const page = Math.max(input.page ?? 1, 1);
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 100);

  const where = {
    schoolId,
    ...(input.academicYearId
      ? { academicYearId: input.academicYearId }
      : {}),
    ...(input.action ? { action: input.action } : {})
  };

  const [records, total] = await prisma.$transaction([
    prisma.academicProgressionHistory.findMany({
      where,
      include: {
        student: true,
        academicYear: true,
        previousGrade: true,
        newGrade: true
      },
      orderBy: {
        performedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.academicProgressionHistory.count({ where })
  ]);

  return {
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
