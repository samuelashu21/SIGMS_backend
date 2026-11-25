
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  reviewClassAttendanceSchema
} from '../validators/attendance-approval.validator.js';

type ReviewInput = z.infer<typeof reviewClassAttendanceSchema>;

export const submitClassAttendance = async (
  schoolId: string,
  attendanceId: string,
  submittedById: string
) => {
  return prisma.$transaction(async (tx) => {
    const attendance = await tx.classAttendance.findFirst({
      where: {
        id: attendanceId,
        schoolId,
        recordedById: submittedById
      },
      include: {
        records: true
      }
    });

    if (!attendance) {
      throw new AppError('Class attendance not found.', 404);
    }

    if (attendance.status !== 'DRAFT') {
      throw new AppError(
        'Only draft attendance can be submitted.',
        409
      );
    }

    if (attendance.records.length === 0) {
      throw new AppError(
        'Attendance must contain student records before submission.',
        400
      );
    }

    return tx.classAttendance.update({
      where: {
        id: attendanceId
      },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: {
        records: {
          include: {
            student: true
          }
        },
        recordedBy: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  });
};

export const reviewClassAttendance = async (
  schoolId: string,
  attendanceId: string,
  approvedById: string,
  input: ReviewInput
) => {
  return prisma.$transaction(async (tx) => {
    const attendance = await tx.classAttendance.findFirst({
      where: {
        id: attendanceId,
        schoolId
      },
      include: {
        records: true
      }
    });

    if (!attendance) {
      throw new AppError('Class attendance not found.', 404);
    }

    if (attendance.status !== 'SUBMITTED') {
      throw new AppError(
        'Only submitted attendance can be reviewed.',
        409
      );
    }

    if (attendance.records.length === 0) {
      throw new AppError(
        'Attendance has no student records.',
        400
      );
    }

    return tx.classAttendance.update({
      where: {
        id: attendanceId
      },
      data: {
        status: input.decision,
        approvedAt: input.decision === 'APPROVED'
          ? new Date()
          : null,
        approvedById,
        remarks: input.remarks ?? attendance.remarks
      },
      include: {
        records: {
          include: {
            student: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
  });
};

export const getPendingClassAttendance = async (
  schoolId: string
) => {
  return prisma.classAttendance.findMany({
    where: {
      schoolId,
      status: 'SUBMITTED'
    },
    include: {
      section: {
        include: {
          grade: true
        }
      },
      academicYear: true,
      recordedBy: {
        select: {
          id: true,
          username: true
        }
      },
      records: {
        include: {
          student: {
            select: {
              id: true,
              studentNumber: true,
              fullName: true
            }
          }
        }
      }
    },
    orderBy: [
      { attendanceDate: 'asc' },
      { createdAt: 'asc' }
    ]
  });
};
