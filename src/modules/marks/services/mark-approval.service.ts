
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type MarkApprovalInput = {
  examinationId: string;
  decision: 'APPROVE' | 'REJECT';
  reviewNotes?: string;
};

export const reviewExaminationMarks = async (
  schoolId: string,
  reviewedById: string,
  input: MarkApprovalInput
) => {
  return prisma.$transaction(async (tx) => {
    const examination = await tx.examination.findFirst({
      where: {
        id: input.examinationId,
        schoolId
      },
      select: {
        id: true,
        status: true
      }
    });

    if (!examination) {
      throw new AppError('Examination not found.', 404);
    }

    if (examination.status !== 'COMPLETED') {
      throw new AppError(
        'Marks approval is only available after examination completion.',
        409
      );
    }

    const submittedRecords = await tx.markRecord.findMany({
      where: {
        schoolId,
        examinationId: input.examinationId,
        status: 'SUBMITTED'
      },
      select: {
        id: true,
        enteredById: true,
        studentId: true
      }
    });

    if (submittedRecords.length === 0) {
      throw new AppError(
        'There are no submitted marks awaiting approval.',
        409
      );
    }

    const selfEnteredRecords = submittedRecords.filter(
      (record) => record.enteredById === reviewedById
    );

    if (selfEnteredRecords.length > 0) {
      throw new AppError(
        'You cannot approve or reject marks that you entered.',
        403
      );
    }

    const updatedAt = new Date();

    const newStatus =
      input.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const result = await tx.markRecord.updateMany({
      where: {
        schoolId,
        examinationId: input.examinationId,
        status: 'SUBMITTED'
      },
      data: {
        status: newStatus,
        approvedById: reviewedById,
        approvedAt: updatedAt,
        approvalNotes: input.reviewNotes ?? null
      }
    });

    return {
      examinationId: input.examinationId,
      decision: input.decision,
      resultingStatus: newStatus,
      reviewedCount: result.count,
      reviewedAt: updatedAt,
      reviewNotes: input.reviewNotes ?? null
    };
  });
};

export const getMarksPendingApproval = async (
  schoolId: string,
  examinationId: string
) => {
  const examination = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      schoolId
    },
    select: { id: true }
  });

  if (!examination) {
    throw new AppError('Examination not found.', 404);
  }

  const records = await prisma.markRecord.findMany({
    where: {
      schoolId,
      examinationId,
      status: 'SUBMITTED'
    },
    include: {
      student: true,
      enteredBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      submittedAt: 'asc'
    }
  });

  return {
    examinationId,
    totalPending: records.length,
    records
  };
};
