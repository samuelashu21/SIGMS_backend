
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const submitExaminationMarks = async (
  schoolId: string,
  submittedById: string,
  examinationId: string
) => {
  return prisma.$transaction(async (tx) => {
    const examination = await tx.examination.findFirst({
      where: {
        id: examinationId,
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
        'Marks can only be submitted after the examination is completed.',
        409
      );
    }

    const draftRecords = await tx.markRecord.findMany({
      where: {
        schoolId,
        examinationId,
        enteredById: submittedById,
        status: 'DRAFT'
      },
      select: {
        id: true
      }
    });

    if (draftRecords.length === 0) {
      throw new AppError(
        'There are no draft marks available for submission.',
        409
      );
    }

    const submittedAt = new Date();

    const result = await tx.markRecord.updateMany({
      where: {
        schoolId,
        examinationId,
        enteredById: submittedById,
        status: 'DRAFT'
      },
      data: {
        status: 'SUBMITTED',
        submittedAt
      }
    });

    return {
      examinationId,
      submittedCount: result.count,
      submittedAt
    };
  });
};

export const getSubmittedExaminationMarks = async (
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
    examinationId,
    status: 'SUBMITTED' as const
  };

  const [records, total] = await prisma.$transaction([
    prisma.markRecord.findMany({
      where,
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
        createdAt: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.markRecord.count({ where })
  ]);

  return {
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
