
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  updateStudentAttendanceSchema,
  studentAttendanceQuerySchema
} from '../validators/student-attendance.validator.js';

type UpdateInput = z.infer<typeof updateStudentAttendanceSchema>;
type QueryInput = z.infer<typeof studentAttendanceQuerySchema>;

export const getStudentAttendanceRecords = async (
  schoolId: string,
  filters: QueryInput
) => {
  const student = await prisma.student.findFirst({
    where: {
      id: filters.studentId,
      schoolId
    },
    select: { id: true }
  });

  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  const startDate = filters.startDate
    ? new Date(`${filters.startDate}T00:00:00.000Z`)
    : undefined;

  const endDate = filters.endDate
    ? new Date(`${filters.endDate}T00:00:00.000Z`)
    : undefined;

  if (startDate && endDate && startDate > endDate) {
    throw new AppError('Start date must not exceed end date.', 400);
  }

  return prisma.attendanceRecord.findMany({
    where: {
      schoolId,
      studentId: filters.studentId,
      ...(filters.status && {
        status: filters.status
      }),
      ...(filters.academicYearId && {
        classAttendance: {
          academicYearId: filters.academicYearId
        }
      }),
      ...(startDate || endDate
        ? {
            classAttendance: {
              ...(filters.academicYearId && {
                academicYearId: filters.academicYearId
              }),
              attendanceDate: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate })
              }
            }
          }
        : {})
    },
    include: {
      classAttendance: {
        include: {
          section: true,
          academicYear: true
        }
      }
    },
    orderBy: {
      classAttendance: {
        attendanceDate: 'desc'
      }
    }
  });
};

export const getStudentAttendanceRecordById = async (
  schoolId: string,
  studentId: string,
  recordId: string
) => {
  const record = await prisma.attendanceRecord.findFirst({
    where: {
      id: recordId,
      schoolId,
      studentId
    },
    include: {
      student: true,
      classAttendance: {
        include: {
          section: true,
          academicYear: true,
          recordedBy: {
            select: {
              id: true,
              username: true
            }
          }
        }
      }
    }
  });

  if (!record) {
    throw new AppError('Student attendance record not found.', 404);
  }

  return record;
};

export const updateStudentAttendanceRecord = async (
  schoolId: string,
  recordId: string,
  input: UpdateInput
) => {
  return prisma.$transaction(async (tx) => {
    const record = await tx.attendanceRecord.findFirst({
      where: {
        id: recordId,
        schoolId
      },
      include: {
        classAttendance: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    if (!record) {
      throw new AppError('Attendance record not found.', 404);
    }

    if (record.classAttendance.status !== 'DRAFT') {
      throw new AppError(
        'Student records can only be edited in draft attendance sessions.',
        409
      );
    }

    return tx.attendanceRecord.update({
      where: {
        id: recordId
      },
      data: {
        ...input,
        ...(input.arrivalTime !== undefined && {
          arrivalTime: input.arrivalTime
            ? new Date(input.arrivalTime)
            : null
        })
      },
      include: {
        student: true,
        classAttendance: true
      }
    });
  });
};
