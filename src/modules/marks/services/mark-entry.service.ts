
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type CreateMarkInput = {
  examinationId: string;
  studentId: string;
  obtainedMarks: number;
  bonusMarks: number;
  penaltyMarks: number;
  remarks?: string;
};

type UpdateMarkInput = {
  obtainedMarks?: number;
  bonusMarks?: number;
  penaltyMarks?: number;
  remarks?: string | null;
};

const validateMarkValues = (
  obtainedMarks: number,
  bonusMarks: number,
  penaltyMarks: number,
  maximumMarks: number,
  allowBonusMarks: boolean,
  allowNegativeMarks: boolean
) => {
  if (obtainedMarks > maximumMarks) {
    throw new AppError(
      'Obtained marks cannot exceed examination maximum marks.',
      400
    );
  }

  if (!allowBonusMarks && bonusMarks > 0) {
    throw new AppError(
      'Bonus marks are not permitted for this examination.',
      400
    );
  }

  if (!allowNegativeMarks && penaltyMarks > 0) {
    throw new AppError(
      'Penalty marks are not permitted for this examination.',
      400
    );
  }
};

export const createMarkEntry = async (
  schoolId: string,
  enteredById: string,
  input: CreateMarkInput
) => {
  return prisma.$transaction(async (tx) => {
    const examination = await tx.examination.findFirst({
      where: {
        id: input.examinationId,
        schoolId
      },
      include: {
        gradingConfiguration: true
      }
    });

    if (!examination) {
      throw new AppError('Examination not found.', 404);
    }

    if (
      examination.status !== 'ONGOING' &&
      examination.status !== 'COMPLETED'
    ) {
      throw new AppError(
        'Marks can only be entered for ongoing or completed examinations.',
        409
      );
    }

    const student = await tx.student.findFirst({
      where: {
        id: input.studentId,
        schoolId,
        isActive: true
      }
    });

    if (!student) {
      throw new AppError('Active student not found.', 404);
    }

    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: examination.academicYearId,
        gradeId: examination.gradeId,
        ...(examination.sectionId && {
          sectionId: examination.sectionId
        }),
        status: 'ACTIVE'
      }
    });

    if (!enrollment) {
      throw new AppError(
        'Student is not actively enrolled in the examination grade or section.',
        400
      );
    }

    const grading = examination.gradingConfiguration;

    const maximumMarks = grading
      ? Number(grading.maximumMarks)
      : Number(examination.totalMarks);

    const allowBonusMarks = grading?.allowBonusMarks ?? false;
    const allowNegativeMarks = grading?.allowNegativeMarks ?? false;

    validateMarkValues(
      input.obtainedMarks,
      input.bonusMarks,
      input.penaltyMarks,
      maximumMarks,
      allowBonusMarks,
      allowNegativeMarks
    );

    const existing = await tx.markRecord.findFirst({
      where: {
        schoolId,
        examinationId: input.examinationId,
        studentId: input.studentId
      }
    });

    if (existing) {
      if (
        existing.status !== 'DRAFT' &&
        existing.status !== 'REJECTED'
      ) {
        throw new AppError(
          'This mark record cannot be changed in its current status.',
          409
        );
      }

      return tx.markRecord.update({
        where: { id: existing.id },
        data: {
          enteredById,
          obtainedMarks: input.obtainedMarks,
          bonusMarks: input.bonusMarks,
          penaltyMarks: input.penaltyMarks,
          remarks: input.remarks,
          status: 'DRAFT'
        },
        include: {
          student: true,
          examination: true
        }
      });
    }

    return tx.markRecord.create({
      data: {
        schoolId,
        examinationId: input.examinationId,
        studentId: input.studentId,
        enteredById,
        obtainedMarks: input.obtainedMarks,
        bonusMarks: input.bonusMarks,
        penaltyMarks: input.penaltyMarks,
        remarks: input.remarks,
        status: 'DRAFT'
      },
      include: {
        student: true,
        examination: true
      }
    });
  });
};

export const updateMarkEntry = async (
  schoolId: string,
  markRecordId: string,
  enteredById: string,
  input: UpdateMarkInput
) => {
  return prisma.$transaction(async (tx) => {
    const record = await tx.markRecord.findFirst({
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

    if (!record) {
      throw new AppError('Mark record not found.', 404);
    }

    if (
      record.status !== 'DRAFT' &&
      record.status !== 'REJECTED'
    ) {
      throw new AppError(
        'Only draft or rejected marks can be edited.',
        409
      );
    }

    const obtainedMarks =
      input.obtainedMarks ?? Number(record.obtainedMarks);

    const bonusMarks =
      input.bonusMarks ?? Number(record.bonusMarks);

    const penaltyMarks =
      input.penaltyMarks ?? Number(record.penaltyMarks);

    const grading = record.examination.gradingConfiguration;

    validateMarkValues(
      obtainedMarks,
      bonusMarks,
      penaltyMarks,
      grading
        ? Number(grading.maximumMarks)
        : Number(record.examination.totalMarks),
      grading?.allowBonusMarks ?? false,
      grading?.allowNegativeMarks ?? false
    );

    return tx.markRecord.update({
      where: { id: markRecordId },
      data: {
        enteredById,
        ...(input.obtainedMarks !== undefined && {
          obtainedMarks: input.obtainedMarks
        }),
        ...(input.bonusMarks !== undefined && {
          bonusMarks: input.bonusMarks
        }),
        ...(input.penaltyMarks !== undefined && {
          penaltyMarks: input.penaltyMarks
        }),
        ...(input.remarks !== undefined && {
          remarks: input.remarks
        }),
        status: 'DRAFT'
      },
      include: {
        student: true,
        examination: true
      }
    });
  });
};

export const getMarkEntryById = async (
  schoolId: string,
  markRecordId: string
) => {
  const record = await prisma.markRecord.findFirst({
    where: {
      id: markRecordId,
      schoolId
    },
    include: {
      student: true,
      examination: true,
      enteredBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    }
  });

  if (!record) {
    throw new AppError('Mark record not found.', 404);
  }

  return record;
};

export const getExaminationMarkEntries = async (
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
    prisma.markRecord.findMany({
      where,
      include: {
        student: true,
        enteredBy: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.markRecord.count({ where })
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
