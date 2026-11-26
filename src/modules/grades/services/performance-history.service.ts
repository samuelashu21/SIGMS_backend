
import type { Prisma } from '../../../generated/prisma/client.js';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type RecordPerformanceHistoryInput = {
  schoolId: string;
  studentId: string;
  academicYearId: string;
  semesterId?: string | null;
  sourceId?: string | null;
  historyType:
    | 'SUBJECT_GRADE'
    | 'SEMESTER_AVERAGE'
    | 'ANNUAL_AVERAGE'
    | 'PERFORMANCE_SUMMARY'
    | 'RANKING';
  action:
    | 'CREATED'
    | 'RECALCULATED'
    | 'CORRECTED'
    | 'PUBLISHED'
    | 'WITHDRAWN';
  previousValues?: Prisma.InputJsonValue | null;
  newValues: Prisma.InputJsonValue;
  reason?: string;
  performedById?: string | null;
};

export const recordAcademicPerformanceHistory = async (
  tx: Prisma.TransactionClient,
  input: RecordPerformanceHistoryInput
) => {
  return tx.academicPerformanceHistory.create({
    data: {
      schoolId: input.schoolId,
      studentId: input.studentId,
      academicYearId: input.academicYearId,
      semesterId: input.semesterId ?? null,
      sourceId: input.sourceId ?? null,
      historyType: input.historyType,
      action: input.action,
      previousValues: input.previousValues ?? undefined,
      newValues: input.newValues,
      reason: input.reason,
      performedById: input.performedById ?? null
    }
  });
};

export const getAcademicPerformanceHistory = async (
  schoolId: string,
  filters: {
    studentId?: string;
    academicYearId?: string;
    semesterId?: string;
    historyType?: RecordPerformanceHistoryInput['historyType'];
    action?: RecordPerformanceHistoryInput['action'];
    page: number;
    limit: number;
  }
) => {
  const where = {
    schoolId,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.academicYearId && {
      academicYearId: filters.academicYearId
    }),
    ...(filters.semesterId && { semesterId: filters.semesterId }),
    ...(filters.historyType && {
      historyType: filters.historyType
    }),
    ...(filters.action && { action: filters.action })
  };

  const [records, total] = await prisma.$transaction([
    prisma.academicPerformanceHistory.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            fullName: true
          }
        },
        academicYear: {
          select: {
            id: true,
            name: true
          }
        },
        semester: {
          select: {
            id: true,
            name: true
          }
        },
        performedBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.academicPerformanceHistory.count({ where })
  ]);

  return {
    records,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const getStudentPerformanceHistory = async (
  schoolId: string,
  studentId: string,
  academicYearId: string
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

  return prisma.academicPerformanceHistory.findMany({
    where: {
      schoolId,
      studentId,
      academicYearId
    },
    include: {
      semester: {
        select: {
          id: true,
          name: true
        }
      },
      performedBy: {
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};




