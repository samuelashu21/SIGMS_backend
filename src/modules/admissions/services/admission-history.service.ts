import type {
  AdmissionStatus,
  Prisma
} from '../../../generated/prisma/client.js';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const recordAdmissionStatusChange = async (
  tx: Prisma.TransactionClient,
  input: {
    schoolId: string;
    applicationId: string;
    changedById: string;
    previousStatus: AdmissionStatus | null;
    newStatus: AdmissionStatus;
    reason?: string;
  }
) => {
  return tx.admissionStatusHistory.create({
    data: {
      ...input,
      reason: input.reason ?? null
    }
  });
};

export const getAdmissionStatusHistory = async (
  schoolId: string,
  applicationId: string
) => {
  const application = await prisma.admissionApplication.findFirst({
    where: { id: applicationId, schoolId }
  });

  if (!application) {
    throw new AppError('Admission application not found.', 404);
  }

  return prisma.admissionStatusHistory.findMany({
    where: { schoolId, applicationId },
    include: {
      changedBy: {
        select: {
          id: true,
          email: true,
          username: true,
          role: true
        }
      }
    },
    orderBy: { changedAt: 'asc' }
  });
};