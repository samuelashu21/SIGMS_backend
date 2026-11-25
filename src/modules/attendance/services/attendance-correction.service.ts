
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAttendanceCorrectionSchema
} from '../validators/attendance-correction.validator.js';
import type { z } from 'zod';


import {
  reviewAttendanceCorrectionSchema
} from '../validators/attendance-correction.validator.js';

type ReviewInput = z.infer<typeof reviewAttendanceCorrectionSchema>;

type CreateInput = z.infer<typeof createAttendanceCorrectionSchema>;

export const createAttendanceCorrection = async (
  schoolId: string,
  requestedById: string,
  input: CreateInput
) => {
  return prisma.$transaction(async (tx) => {
    const record = await tx.attendanceRecord.findFirst({
      where: {
        id: input.attendanceRecordId,
        schoolId
      },
      include: {
        classAttendance: {
          select: {
            status: true
          }
        }
      }
    });

    if (!record) {
      throw new AppError('Attendance record not found.', 404);
    }

    if (record.classAttendance.status !== 'APPROVED') {
      throw new AppError(
        'Corrections can only be requested for approved attendance.',
        409
      );
    }

    if (record.status === input.requestedStatus) {
      throw new AppError(
        'The requested status is the same as the current status.',
        400
      );
    }

    const pendingCorrection =
      await tx.attendanceCorrection.findFirst({
        where: {
          schoolId,
          attendanceRecordId: record.id,
          status: 'PENDING'
        },
        select: { id: true }
      });

    if (pendingCorrection) {
      throw new AppError(
        'A pending correction already exists for this record.',
        409
      );
    }

    return tx.attendanceCorrection.create({
      data: {
        schoolId,
        attendanceRecordId: record.id,
        requestedById,
        previousStatus: record.status,
        requestedStatus: input.requestedStatus,
        reason: input.reason
      },
      include: {
        attendanceRecord: {
          include: {
            student: true
          }
        },
        requestedBy: {
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

export const getAttendanceCorrections = async (
  schoolId: string,
  filters: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    attendanceRecordId?: string;
  }
) => {
  return prisma.attendanceCorrection.findMany({
    where: {
      schoolId,
      ...(filters.status && { status: filters.status }),
      ...(filters.attendanceRecordId && {
        attendanceRecordId: filters.attendanceRecordId
      })
    },
    include: {
      attendanceRecord: {
        include: {
          student: true,
          classAttendance: {
            include: {
              section: true
            }
          }
        }
      },
      requestedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      },
      reviewedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      requestedAt: 'desc'
    }
  });
};




export const reviewAttendanceCorrection = async (
  schoolId: string,
  correctionId: string,
  reviewedById: string,
  input: ReviewInput
) => {
  return prisma.$transaction(async (tx) => {
    const correction = await tx.attendanceCorrection.findFirst({
      where: {
        id: correctionId,
        schoolId,
        status: 'PENDING'
      },
      include: {
        attendanceRecord: {
          include: {
            classAttendance: true
          }
        }
      }
    });

    if (!correction) {
      throw new AppError(
        'Pending attendance correction not found.',
        404
      );
    }

    if (correction.attendanceRecord.classAttendance.status !== 'APPROVED') {
      throw new AppError(
        'The original attendance session is no longer approved.',
        409
      );
    }

    if (
      correction.attendanceRecord.status !== correction.previousStatus
    ) {
      throw new AppError(
        'The attendance record has changed since the correction was requested.',
        409
      );
    }

    if (input.decision === 'APPROVED') {
      await tx.attendanceRecord.update({
        where: {
          id: correction.attendanceRecordId
        },
        data: {
          status: correction.requestedStatus
        }
      });
    }

    return tx.attendanceCorrection.update({
      where: {
        id: correctionId
      },
      data: {
        status: input.decision,
        reviewedById,
        reviewedAt: new Date(),
        reviewNotes: input.reviewNotes
      },
      include: {
        attendanceRecord: {
          include: {
            student: true
          }
        },
        requestedBy: {
          select: {
            id: true,
            username: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  });
};
