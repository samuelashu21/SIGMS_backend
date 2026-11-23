
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  isAllowedAdmissionTransition,
  type AdmissionStatusValue
} from '../constants/admission-status.constants.js';

import {
  recordAdmissionStatusChange
} from './admission-history.service.js';

export const updateAdmissionStatus = async (
  schoolId: string,
  applicationId: string,
  changedById: string,
  nextStatus: AdmissionStatusValue,
  reason: string
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

    const currentStatus = application.status as AdmissionStatusValue;

    if (!isAllowedAdmissionTransition(currentStatus, nextStatus)) {
      throw new AppError(
        `Status transition from ${currentStatus} to ${nextStatus} is not allowed.`,
        409
      );
    }

    // Validate applicant contact information before submission.
    if (nextStatus === 'SUBMITTED') {
      const information = await tx.applicantInformation.findUnique({
        where: {
          applicationId_schoolId: {
            applicationId,
            schoolId
          }
        }
      });

      if (
        !information ||
        (
          !information.phoneNumber &&
          !information.email &&
          !information.guardianPhone &&
          !information.guardianEmail
        )
      ) {
        throw new AppError(
          'Applicant or guardian contact information is required before submission.',
          400
        );
      }
    }

    const result = await tx.admissionApplication.updateMany({
      where: {
        id: applicationId,
        schoolId,
        status: currentStatus
      },
      data: {
        status: nextStatus,
        ...(nextStatus === 'SUBMITTED' && {
          submittedAt: new Date()
        })
      }
    });

    if (result.count !== 1) {
      throw new AppError(
        'Application status changed before this update could be saved.',
        409
      );
    }

    await recordAdmissionStatusChange(tx, {
      schoolId,
      applicationId,
      changedById,
      previousStatus: currentStatus,
      newStatus: nextStatus,
      reason
    });

    return tx.admissionApplication.findFirstOrThrow({
      where: {
        id: applicationId,
        schoolId
      },
      include: {
        requestedGrade: true,
        academicYear: true,
        applicantInformation: true
      }
    });
  });
};
