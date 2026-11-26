
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { Prisma } from '../../../generated/prisma/client.js';

export type RecordExaminationHistoryInput = {
  schoolId: string;
  examinationId: string;
  performedById: string;
  action:
    | 'CREATED'
    | 'UPDATED'
    | 'SCHEDULED'
    | 'STATUS_CHANGED'
    | 'GRADING_CONFIGURED'
    | 'GRADING_UPDATED'
    | 'CANCELLED';
  previousStatus?: string | null;
  newStatus?: string | null;
  description?: string;
  changes?: Prisma.InputJsonValue;
};

export const recordExaminationHistory = async (
  tx: Prisma.TransactionClient,
  input: RecordExaminationHistoryInput
) => {
  return tx.examinationHistory.create({
    data: {
      schoolId: input.schoolId,
      examinationId: input.examinationId,
      performedById: input.performedById,
      action: input.action,
      previousStatus: input.previousStatus as never,
      newStatus: input.newStatus as never,
      description: input.description,
      changes: input.changes
    }
  });
};

export const getExaminationHistory = async (
  schoolId: string,
  examinationId: string,
  page = 1,
  limit = 20
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

  const where = {
    schoolId,
    examinationId
  };

  const [data, total] = await prisma.$transaction([
    prisma.examinationHistory.findMany({
      where,
      include: {
        performedBy: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.examinationHistory.count({ where })
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
