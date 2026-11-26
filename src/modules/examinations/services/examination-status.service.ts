
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  isAllowedExaminationTransition,
  type ExaminationStatus
} from '../constants/examination-status.js';

import {
  recordExaminationHistory
} from './examination-history.service.js';

/**
 * Update examination status and record history
 * within the same Prisma transaction.
 */
export const updateExaminationStatus = async (
  schoolId: string,
  examinationId: string,
  performedById: string,
  nextStatus: ExaminationStatus,
  reason?: string
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find examination.
    const examination = await tx.examination.findFirst({
      where: {
        id: examinationId,
        schoolId
      }
    });

    if (!examination) {
      throw new AppError('Examination not found.', 404);
    }

    // 2. Get current status.
    const currentStatus =
      examination.status as ExaminationStatus;

    // 3. Validate status transition.
    if (
      !isAllowedExaminationTransition(
        currentStatus,
        nextStatus
      )
    ) {
      throw new AppError(
        `Cannot change examination status from ${currentStatus} to ${nextStatus}.`,
        409
      );
    }

    // 4. Validate examination schedule before scheduling.
    if (nextStatus === 'SCHEDULED') {
      if (
        !examination.examinationDate ||
        !examination.startTime ||
        !examination.endTime ||
        !examination.room
      ) {
        throw new AppError(
          'An examination must have a complete schedule before being scheduled.',
          400
        );
      }
    }

    // 5. Only scheduled examinations can be started.
    if (nextStatus === 'ONGOING') {
      if (examination.status !== 'SCHEDULED') {
        throw new AppError(
          'Only scheduled examinations can be started.',
          409
        );
      }
    }

    // 6. Only ongoing examinations can be completed.
    if (nextStatus === 'COMPLETED') {
      if (examination.status !== 'ONGOING') {
        throw new AppError(
          'Only ongoing examinations can be completed.',
          409
        );
      }
    }

    // 7. Update examination.
    const updatedExamination = await tx.examination.update({
      where: {
        id: examinationId
      },
      data: {
        status: nextStatus,
        ...(nextStatus === 'SCHEDULED' && {
          publishedAt: new Date()
        })
      },
      include: {
        academicYear: true,
        semester: true,
        grade: true,
        section: true,
        subject: true
      }
    });

    // 8. Record examination history.
    // This uses the SAME transaction as the examination update.
    await recordExaminationHistory(tx, {
      schoolId,
      examinationId,
      performedById,
      action: nextStatus === 'CANCELLED'
        ? 'CANCELLED'
        : 'STATUS_CHANGED',
      previousStatus: currentStatus,
      newStatus: nextStatus,
      description:
        reason ?? `Status changed to ${nextStatus}.`
    });

    // 9. Return updated examination.
    return updatedExamination;
  });
};

/**
 * Get examinations filtered by status.
 */
export const getExaminationsByStatus = async (
  schoolId: string,
  status: ExaminationStatus,
  academicYearId?: string
) => {
  return prisma.examination.findMany({
    where: {
      schoolId,
      status,
      ...(academicYearId && { academicYearId })
    },
    include: {
      academicYear: true,
      semester: true,
      grade: true,
      section: true,
      subject: true
    },
    orderBy: [
      { examinationDate: 'asc' },
      { createdAt: 'desc' }
    ]
  });
};
