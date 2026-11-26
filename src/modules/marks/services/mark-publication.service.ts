
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const publishExaminationMarks = async (
  schoolId: string,
  publishedById: string,
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
        'Marks can only be published after examination completion.',
        409
      );
    }

    const unresolvedRecords = await tx.markRecord.count({
      where: {
        schoolId,
        examinationId,
        status: {
          in: ['DRAFT', 'SUBMITTED', 'REJECTED']
        }
      }
    });

    if (unresolvedRecords > 0) {
      throw new AppError(
        'All draft, submitted, and rejected marks must be resolved before publication.',
        409
      );
    }

    const pendingCorrections = await tx.markCorrection.count({
      where: {
        schoolId,
        status: 'PENDING',
        markRecord: {
          examinationId
        }
      }
    });

    if (pendingCorrections > 0) {
      throw new AppError(
        'Pending mark corrections must be reviewed before publication.',
        409
      );
    }

    const approvedCount = await tx.markRecord.count({
      where: {
        schoolId,
        examinationId,
        status: 'APPROVED'
      }
    });

    if (approvedCount === 0) {
      throw new AppError(
        'There are no approved marks available for publication.',
        409
      );
    }

    const publishedAt = new Date();

    const result = await tx.markRecord.updateMany({
      where: {
        schoolId,
        examinationId,
        status: 'APPROVED'
      },
      data: {
        status: 'PUBLISHED',
        publishedAt,
        publishedById
      }
    });

    return {
      examinationId,
      publishedCount: result.count,
      publishedAt,
      publishedById
    };
  });
};

export const getPublishedExaminationMarks = async (
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
    select: {
      id: true,
      name: true
    }
  });

  if (!examination) {
    throw new AppError('Examination not found.', 404);
  }

  const where = {
    schoolId,
    examinationId,
    status: 'PUBLISHED' as const
  };

  const [records, total] = await prisma.$transaction([
    prisma.markRecord.findMany({
      where,
      include: {
        student: true,
        publishedBy: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        student: {
          fullName: 'asc'
        }
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.markRecord.count({ where })
  ]);

  return {
    examination,
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
