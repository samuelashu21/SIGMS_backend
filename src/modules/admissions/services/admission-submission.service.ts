import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const submitAdmissionApplication = async (
  schoolId: string,
  applicationId: string,
  submittedById: string
) => {
  const application = await prisma.admissionApplication.findFirst({
    where: { id: applicationId, schoolId },
    include: {
      applicantInformation: true,
      documents: true
    }
  });

  if (!application) {
    throw new AppError('Admission application not found.', 404);
  }

  if (application.status !== 'DRAFT') {
    throw new AppError(
      'Only draft applications can be submitted.',
      409
    );
  }

  if (!application.applicantInformation) {
    throw new AppError(
      'Applicant contact information must be provided before submission.',
      400
    );
  }

  const information = application.applicantInformation;

  if (
    !information.phoneNumber &&
    !information.email &&
    !information.guardianPhone &&
    !information.guardianEmail
  ) {
    throw new AppError(
      'At least one applicant or guardian contact method is required.',
      400
    );
  }

  return prisma.$transaction(async (tx) => {
    const result = await tx.admissionApplication.updateMany({
      where: {
        id: applicationId,
        schoolId,
        status: 'DRAFT'
      },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
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
        changedById: submittedById,
        previousStatus: 'DRAFT',
        newStatus: 'SUBMITTED',
        reason: 'Application submitted.'
      }
    });

    return tx.admissionApplication.findFirstOrThrow({
      where: { id: applicationId, schoolId },
      include: {
        applicantInformation: true,
        documents: true,
        requestedGrade: true,
        academicYear: true
      }
    });
  });
};