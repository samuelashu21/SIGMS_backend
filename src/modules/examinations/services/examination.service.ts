
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  createExaminationSchema,
  updateExaminationSchema,
  examinationListQuerySchema
} from '../validators/examination.validator.js';

type CreateExaminationInput =
  z.infer<typeof createExaminationSchema>;

type UpdateExaminationInput =
  z.infer<typeof updateExaminationSchema>;

type ExaminationFilters =
  z.infer<typeof examinationListQuerySchema>;

export const createExamination = async (
  schoolId: string,
  createdById: string,
  input: CreateExaminationInput
) => {
  return prisma.$transaction(async (tx) => {
    const academicYear = await tx.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      }
    });

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }

    if (
      input.semesterId &&
      !(await tx.semester.findFirst({
        where: {
          id: input.semesterId,
          schoolId,
          academicYearId: input.academicYearId
        }
      }))
    ) {
      throw new AppError(
        'Semester does not belong to the selected academic year.',
        400
      );
    }

    if (
      !(await tx.grade.findFirst({
        where: {
          id: input.gradeId,
          schoolId
        }
      }))
    ) {
      throw new AppError('Grade not found.', 404);
    }

    if (
      input.sectionId &&
      !(await tx.section.findFirst({
        where: {
          id: input.sectionId,
          schoolId,
          gradeId: input.gradeId,
          academicYearId: input.academicYearId
        }
      }))
    ) {
      throw new AppError(
        'Section does not belong to the selected grade and academic year.',
        400
      );
    }

    if (
      !(await tx.subject.findFirst({
        where: {
          id: input.subjectId,
          schoolId
        }
      }))
    ) {
      throw new AppError('Subject not found.', 404);
    }

    const gradeSubject = await tx.gradeSubject.findFirst({
      where: {
        schoolId,
        gradeId: input.gradeId,
        subjectId: input.subjectId
      }
    });

    if (!gradeSubject) {
      throw new AppError(
        'Subject is not assigned to the selected grade.',
        400
      );
    }

    return tx.examination.create({
      data: {
        schoolId,
        academicYearId: input.academicYearId,
        semesterId: input.semesterId ?? null,
        gradeId: input.gradeId,
        sectionId: input.sectionId ?? null,
        subjectId: input.subjectId,
        name: input.name,
        description: input.description,
        type: input.type,
        mode: input.mode,
        totalMarks: input.totalMarks,
        passingMarks: input.passingMarks ?? null,
        weight: input.weight ?? null,
        instructions: input.instructions,
        createdById
      },
      include: {
        academicYear: true,
        semester: true,
        grade: true,
        section: true,
        subject: true
      }
    });
  });
};

export const getExaminationById = async (
  schoolId: string,
  examinationId: string
) => {
  const examination = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      schoolId
    },
    include: {
      academicYear: true,
      semester: true,
      grade: true,
      section: true,
      subject: true,
      createdBy: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });

  if (!examination) {
    throw new AppError('Examination not found.', 404);
  }

  return examination;
};

export const getExaminations = async (
  schoolId: string,
  filters: ExaminationFilters
) => {
  const where = {
    schoolId,
    ...(filters.academicYearId && {
      academicYearId: filters.academicYearId
    }),
    ...(filters.semesterId && {
      semesterId: filters.semesterId
    }),
    ...(filters.gradeId && {
      gradeId: filters.gradeId
    }),
    ...(filters.sectionId && {
      sectionId: filters.sectionId
    }),
    ...(filters.subjectId && {
      subjectId: filters.subjectId
    }),
    ...(filters.type && {
      type: filters.type
    }),
    ...(filters.status && {
      status: filters.status
    })
  };

  const [data, total] = await prisma.$transaction([
    prisma.examination.findMany({
      where,
      include: {
        grade: true,
        section: true,
        subject: true,
        academicYear: true,
        semester: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.examination.count({ where })
  ]);

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const updateExamination = async (
  schoolId: string,
  examinationId: string,
  input: UpdateExaminationInput
) => {
  const existing = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      schoolId
    }
  });

  if (!existing) {
    throw new AppError('Examination not found.', 404);
  }

  if (existing.status !== 'DRAFT') {
    throw new AppError(
      'Only draft examinations can be edited.',
      409
    );
  }

  const totalMarks = input.totalMarks ?? Number(existing.totalMarks);
  const passingMarks =
    input.passingMarks === undefined
      ? existing.passingMarks === null
        ? null
        : Number(existing.passingMarks)
      : input.passingMarks;

  if (passingMarks !== null && passingMarks > totalMarks) {
    throw new AppError(
      'Passing marks cannot exceed total marks.',
      400
    );
  }

  return prisma.examination.update({
    where: {
      id: examinationId
    },
    data: input
  });
};

export const deleteDraftExamination = async (
  schoolId: string,
  examinationId: string
) => {
  const examination = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      schoolId
    }
  });

  if (!examination) {
    throw new AppError('Examination not found.', 404);
  }

  if (examination.status !== 'DRAFT') {
    throw new AppError(
      'Only draft examinations can be deleted.',
      409
    );
  }

  return prisma.examination.delete({
    where: {
      id: examinationId
    }
  });
};
