import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateAdmissionReviewInput
} from '../validators/admission-review.validator.js';

export const createAdmissionReview = async (
  schoolId: string,
  applicationId: string,
  reviewerId: string,
  input: CreateAdmissionReviewInput
) => {
  const application = await prisma.admissionApplication.findFirst({
    where: {
      id: applicationId,
      schoolId
    }
  });

  if (!application) {
    throw new AppError('Admission application not found.', 404);
  }

  if (
    application.status !== 'SUBMITTED' &&
    application.status !== 'UNDER_REVIEW'
  ) {
    throw new AppError(
      'Only submitted or under-review applications can be reviewed.',
      409
    );
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.admissionReview.create({
      data: {
        schoolId,
        applicationId,
        reviewerId,
        reviewType: input.reviewType,
        comments: input.comments
      },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true
          }
        }
      }
    });

    const nextStatus =
      input.reviewType === 'REQUEST_INFORMATION'
        ? 'NEEDS_INFORMATION'
        : 'UNDER_REVIEW';

    if (application.status !== nextStatus) {
      const result = await tx.admissionApplication.updateMany({
        where: {
          id: applicationId,
          schoolId,
          status: application.status
        },
        data: {
          status: nextStatus
        }
      });

      if (result.count !== 1) {
        throw new AppError(
          'Application status changed. Please reload.',
          409
        );
      }

      await tx.admissionStatusHistory.create({
        data: {
          schoolId,
          applicationId,
          changedById: reviewerId,
          previousStatus: application.status,
          newStatus: nextStatus,
          reason: input.comments
        }
      });
    }

    return review;
  });
};

export const getAdmissionReviews = async (
  schoolId: string,
  applicationId: string
) => {
  const application = await prisma.admissionApplication.findFirst({
    where: { id: applicationId, schoolId }
  });

  if (!application) {
    throw new AppError('Admission application not found.', 404);
  }

  return prisma.admissionReview.findMany({
    where: {
      schoolId,
      applicationId
    },
    include: {
      reviewer: {
        select: {
          id: true,
          email: true,
          username: true,
          role: true
        }
      }
    },
    orderBy: { reviewedAt: 'desc' }
  });
};