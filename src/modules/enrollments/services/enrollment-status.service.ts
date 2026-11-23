
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  isAllowedEnrollmentTransition,
  type EnrollmentStatus
} from '../constants/enrollment-status.constants.js';

import {
  recordEnrollmentHistory
} from './enrollment-history.service.js';

export const updateEnrollmentStatus = async (
  schoolId: string,
  enrollmentId: string,
  nextStatus: EnrollmentStatus,
  reason: string,
  changedById: string
) => {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        id: enrollmentId,
        schoolId
      }
    });

    if (!enrollment) {
      throw new AppError('Academic enrollment not found.', 404);
    }

    if (
      !isAllowedEnrollmentTransition(
        enrollment.status as EnrollmentStatus,
        nextStatus
      )
    ) {
      throw new AppError(
        `Cannot change enrollment status from ${enrollment.status} to ${nextStatus}.`,
        409
      );
    }

    const result = await tx.academicEnrollment.updateMany({
      where: {
        id: enrollmentId,
        schoolId,
        status: enrollment.status
      },
      data: {
        status: nextStatus,
        statusReason: reason,
        statusChangedAt: new Date()
      }
    });

    if (result.count !== 1) {
      throw new AppError(
        'Enrollment status changed concurrently. Please refresh.',
        409
      );
    }

    // Record enrollment status history.
    await recordEnrollmentHistory(tx, {
      schoolId,
      enrollmentId,
      changedById,
      action: 'STATUS_CHANGED',
      previousStatus: enrollment.status,
      newStatus: nextStatus,
      reason
    });

    return tx.academicEnrollment.findFirstOrThrow({
      where: {
        id: enrollmentId,
        schoolId
      },
      include: {
        student: true,
        academicYear: true,
        grade: true,
        section: true
      }
    });
  });
};
