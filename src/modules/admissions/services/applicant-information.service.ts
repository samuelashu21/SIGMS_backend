import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  ApplicantInformationInput
} from '../validators/applicant-information.validator.js';

export const getApplicantInformation = async (
  schoolId: string,
  applicationId: string
) => {
  const application = await prisma.admissionApplication.findFirst({
    where: { id: applicationId, schoolId },
    include: { applicantInformation: true }
  });

  if (!application) {
    throw new AppError('Admission application not found.', 404);
  }

  return application.applicantInformation;
};

export const saveApplicantInformation = async (
  schoolId: string,
  applicationId: string,
  input: ApplicantInformationInput
) => {
  const application = await prisma.admissionApplication.findFirst({
    where: { id: applicationId, schoolId }
  });

  if (!application) {
    throw new AppError('Admission application not found.', 404);
  }

  if (application.status !== 'DRAFT') {
    throw new AppError(
      'Applicant information can only be changed while the application is a draft.',
      409
    );
  }

  return prisma.applicantInformation.upsert({
    where: {
      applicationId_schoolId: {
        applicationId,
        schoolId
      }
    },
    create: {
      schoolId,
      applicationId,
      ...input
    },
    update: input
  });
};