
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateStudentTransferInput
} from '../validators/student-transfer.validator.js';

export const createStudentTransfer = async (
  sourceSchoolId: string,
  studentId: string,
  requestedById: string,
  input: CreateStudentTransferInput
) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: {
        id: studentId,
        schoolId: sourceSchoolId,
        isActive: true
      }
    });

    if (!student) {
      throw new AppError('Active student not found.', 404);
    }

    if (input.transferType === 'EXTERNAL') {
      const destination = await tx.school.findFirst({
        where: {
          id: input.destinationSchoolId!,
          isActive: true
        },
        select: { id: true }
      });

      if (!destination) {
        throw new AppError('Destination school not found.', 404);
      }

      if (input.destinationSchoolId === sourceSchoolId) {
        throw new AppError(
          'Destination school must differ from source school.',
          400
        );
      }
    }

    const existingTransfer = await tx.studentTransfer.findFirst({
      where: {
        studentId,
        sourceSchoolId,
        status: {
          in: ['REQUESTED', 'APPROVED']
        }
      }
    });

    if (existingTransfer) {
      throw new AppError(
        'Student already has an active transfer request.',
        409
      );
    }

    return tx.studentTransfer.create({
      data: {
        studentId,
        sourceSchoolId,
        destinationSchoolId:
          input.transferType === 'EXTERNAL'
            ? input.destinationSchoolId
            : null,
        transferType: input.transferType,
        reason: input.reason,
        requestedById
      },
      include: {
        student: true,
        sourceSchool: true,
        destinationSchool: true
      }
    });
  });
};

export const decideStudentTransfer = async (
  sourceSchoolId: string,
  transferId: string,
  reviewedById: string,
  decision: 'APPROVED' | 'REJECTED',
  decisionReason: string
) => {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.studentTransfer.findFirst({
      where: {
        id: transferId,
        sourceSchoolId,
        status: 'REQUESTED'
      }
    });

    if (!transfer) {
      throw new AppError(
        'Pending transfer request not found.',
        404
      );
    }

    const updated = await tx.studentTransfer.updateMany({
      where: {
        id: transferId,
        sourceSchoolId,
        status: 'REQUESTED'
      },
      data: {
        status: decision,
        reviewedById,
        decisionReason,
        decisionAt: new Date()
      }
    });

    if (updated.count !== 1) {
      throw new AppError(
        'Transfer request has already been processed.',
        409
      );
    }

    return tx.studentTransfer.findFirstOrThrow({
      where: {
        id: transferId,
        sourceSchoolId
      },
      include: {
        student: true,
        sourceSchool: true,
        destinationSchool: true,
        requestedBy: {
          select: { id: true, username: true, email: true }
        },
        reviewedBy: {
          select: { id: true, username: true, email: true }
        }
      }
    });
  });
};

export const getStudentTransfers = async (
  schoolId: string,
  studentId: string
) => {
  return prisma.studentTransfer.findMany({
    where: {
      sourceSchoolId: schoolId,
      studentId
    },
    include: {
      sourceSchool: true,
      destinationSchool: true,
      requestedBy: {
        select: { id: true, username: true }
      },
      reviewedBy: {
        select: { id: true, username: true }
      }
    },
    orderBy: {
      requestedAt: 'desc'
    }
  });
};
