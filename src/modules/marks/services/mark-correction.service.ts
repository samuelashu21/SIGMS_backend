
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type CorrectionInput = {
  obtainedMarks: number;
  bonusMarks: number;
  penaltyMarks: number;
  reason: string;
};

export const requestMarkCorrection = async (
  schoolId: string,
  requestedById: string,
  markRecordId: string,
  input: CorrectionInput
) => {
  return prisma.$transaction(async (tx) => {
    const mark = await tx.markRecord.findFirst({
      where: {
        id: markRecordId,
        schoolId
      },
      include: {
        examination: {
          include: {
            gradingConfiguration: true
          }
        }
      }
    });

    if (!mark) {
      throw new AppError('Mark record not found.', 404);
    }

    if (
      mark.status !== 'APPROVED' &&
      mark.status !== 'PUBLISHED'
    ) {
      throw new AppError(
        'Only approved or published marks can be corrected.',
        409
      );
    }

    const pendingCorrection = await tx.markCorrection.findFirst({
      where: {
        schoolId,
        markRecordId,
        status: 'PENDING'
      }
    });

    if (pendingCorrection) {
      throw new AppError(
        'A correction request is already pending for this mark.',
        409
      );
    }

    const grading = mark.examination.gradingConfiguration;
    const maximumMarks = grading
      ? Number(grading.maximumMarks)
      : Number(mark.examination.totalMarks);

    if (input.obtainedMarks > maximumMarks) {
      throw new AppError('Obtained marks exceed the maximum.', 400);
    }

    if (!grading?.allowBonusMarks && input.bonusMarks > 0) {
      throw new AppError('Bonus marks are not permitted.', 400);
    }

    if (
      grading?.maximumBonusMarks != null &&
      input.bonusMarks > Number(grading.maximumBonusMarks)
    ) {
      throw new AppError('Bonus marks exceed the configured limit.', 400);
    }

    if (!grading?.allowNegativeMarks && input.penaltyMarks > 0) {
      throw new AppError('Penalty marks are not permitted.', 400);
    }

    const correction = await tx.markCorrection.create({
      data: {
        schoolId,
        markRecordId,
        requestedById,
        previousObtainedMarks: mark.obtainedMarks,
        requestedObtainedMarks: input.obtainedMarks,
        previousBonusMarks: mark.bonusMarks,
        requestedBonusMarks: input.bonusMarks,
        previousPenaltyMarks: mark.penaltyMarks,
        requestedPenaltyMarks: input.penaltyMarks,
        reason: input.reason
      }
    });

    return correction;
  });
};

export const reviewMarkCorrection = async (
  schoolId: string,
  reviewedById: string,
  correctionId: string,
  decision: 'APPROVE' | 'REJECT',
  reviewNotes?: string
) => {
  return prisma.$transaction(async (tx) => {
    const correction = await tx.markCorrection.findFirst({
      where: {
        id: correctionId,
        schoolId
      },
      include: {
        markRecord: {
          include: {
            examination: {
              include: {
                gradingConfiguration: true
              }
            }
          }
        }
      }
    });

    if (!correction) {
      throw new AppError('Correction request not found.', 404);
    }

    if (correction.status !== 'PENDING') {
      throw new AppError(
        'This correction request has already been reviewed.',
        409
      );
    }

    if (correction.requestedById === reviewedById) {
      throw new AppError(
        'You cannot review your own correction request.',
        403
      );
    }

    const mark = correction.markRecord;

    if (
      mark.status !== 'APPROVED' &&
      mark.status !== 'PUBLISHED'
    ) {
      throw new AppError(
        'The mark is no longer eligible for correction.',
        409
      );
    }

    // Prevent applying a correction to a mark that changed
    // after the request was created.
    if (
      Number(mark.obtainedMarks) !== Number(correction.previousObtainedMarks) ||
      Number(mark.bonusMarks) !== Number(correction.previousBonusMarks) ||
      Number(mark.penaltyMarks) !== Number(correction.previousPenaltyMarks)
    ) {
      throw new AppError(
        'The mark changed after this correction was requested. Create a new request.',
        409
      );
    }

    const reviewedAt = new Date();

    if (decision === 'APPROVE') {
      const updatedMark = await tx.markRecord.update({
        where: {
          id: mark.id
        },
        data: {
          obtainedMarks: correction.requestedObtainedMarks,
          bonusMarks: correction.requestedBonusMarks,
          penaltyMarks: correction.requestedPenaltyMarks
        }
      });

      await tx.markCorrection.update({
        where: {
          id: correctionId
        },
        data: {
          status: 'APPROVED',
          reviewedById,
          reviewedAt,
          reviewNotes: reviewNotes ?? null
        }
      });

      return {
        correctionId,
        markRecordId: updatedMark.id,
        decision,
        reviewedAt,
        mark: updatedMark
      };
    }

    const updatedCorrection = await tx.markCorrection.update({
      where: {
        id: correctionId
      },
      data: {
        status: 'REJECTED',
        reviewedById,
        reviewedAt,
        reviewNotes: reviewNotes ?? null
      }
    });

    return {
      correctionId: updatedCorrection.id,
      decision,
      reviewedAt,
      markRecordId: mark.id
    };
  });
};

export const getMarkCorrections = async (
  schoolId: string,
  markRecordId: string
) => {
  const mark = await prisma.markRecord.findFirst({
    where: {
      id: markRecordId,
      schoolId
    },
    select: {
      id: true
    }
  });

  if (!mark) {
    throw new AppError('Mark record not found.', 404);
  }

  return txSafeCorrectionList(schoolId, markRecordId);
};

const txSafeCorrectionList = async (
  schoolId: string,
  markRecordId: string
) => {
  return prisma.markCorrection.findMany({
    where: {
      schoolId,
      markRecordId
    },
    include: {
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

export const getPendingMarkCorrections = async (
  schoolId: string,
  examinationId: string
) => {
  const examination = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      schoolId
    },
    select: {
      id: true
    }
  });

  if (!examination) {
    throw new AppError('Examination not found.', 404);
  }

  return prisma.markCorrection.findMany({
    where: {
      schoolId,
      status: 'PENDING',
      markRecord: {
        examinationId
      }
    },
    include: {
      markRecord: {
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
    },
    orderBy: {
      requestedAt: 'asc'
    }
  });
};
