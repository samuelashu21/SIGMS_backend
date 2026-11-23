
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  recordAdmissionStatusChange
} from './admission-history.service.js';

const decideAdmission = async (
  schoolId: string,
  applicationId: string,
  decisionById: string,
  status: 'APPROVED' | 'REJECTED',
  decisionReason?: string
) => {
  return prisma.$transaction(async (tx) => {
    const application = await tx.admissionApplication.findFirst({
      where: {
        id: applicationId,
        schoolId
      }
    });

    if (!application) {
      throw new AppError('Admission application not found.', 404);
    }

    if (application.status !== 'UNDER_REVIEW') {
      throw new AppError(
        'Only applications under review can receive a final decision.',
        409
      );
    }

    const reviewCount = await tx.admissionReview.count({
      where: {
        schoolId,
        applicationId
      }
    });

    if (reviewCount === 0) {
      throw new AppError(
        'At least one application review is required before a decision.',
        409
      );
    }

    const result = await tx.admissionApplication.updateMany({
      where: {
        id: applicationId,
        schoolId,
        status: 'UNDER_REVIEW'
      },
      data: {
        status,
        decisionAt: new Date(),
        decisionById,
        decisionReason: decisionReason ?? null
      }
    });

    if (result.count !== 1) {
      throw new AppError(
        'The application status changed before the decision could be saved.',
        409
      );
    }

    await recordAdmissionStatusChange(tx, {
      schoolId,
      applicationId,
      changedById: decisionById,
      previousStatus: 'UNDER_REVIEW',
      newStatus: status,
      reason:
        decisionReason ??
        (status === 'APPROVED'
          ? 'Application approved.'
          : 'Application rejected.')
    });

    return tx.admissionApplication.findFirstOrThrow({
      where: {
        id: applicationId,
        schoolId
      },
      include: {
        applicantInformation: true,
        requestedGrade: true,
        academicYear: true,
        decisionBy: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true
          }
        }
      }
    });
  });
};

export const approveAdmissionApplication = (
  schoolId: string,
  applicationId: string,
  decisionById: string,
  decisionReason?: string
) => {
  return decideAdmission(
    schoolId,
    applicationId,
    decisionById,
    'APPROVED',
    decisionReason
  );
};

export const rejectAdmissionApplication = (
  schoolId: string,
  applicationId: string,
  decisionById: string,
  decisionReason: string
) => {
  return decideAdmission(
    schoolId,
    applicationId,
    decisionById,
    'REJECTED',
    decisionReason
  );
};
