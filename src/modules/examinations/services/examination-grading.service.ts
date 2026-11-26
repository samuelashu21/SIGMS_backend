
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  createExaminationGradingSchema,
  updateExaminationGradingSchema
} from '../validators/examination-grading.validator.js';

type CreateGradingInput =
  z.infer<typeof createExaminationGradingSchema>;

type UpdateGradingInput =
  z.infer<typeof updateExaminationGradingSchema>;

export const createExaminationGradingConfiguration = async (
  schoolId: string,
  examinationId: string,
  input: CreateGradingInput
) => {
  return prisma.$transaction(async (tx) => {
    const examination = await tx.examination.findFirst({
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
        'Grading configuration can only be created for draft examinations.',
        409
      );
    }

    if (
      Number(examination.totalMarks) !== input.maximumMarks
    ) {
      throw new AppError(
        'Maximum marks must match the examination total marks.',
        400
      );
    }

    if (
      input.passingMarks > Number(examination.totalMarks)
    ) {
      throw new AppError(
        'Passing marks exceed the examination total.',
        400
      );
    }

    if (
      input.negativeMarkValue !== undefined &&
      input.negativeMarkValue !== null &&
      input.negativeMarkValue > input.maximumMarks
    ) {
      throw new AppError(
        'Negative mark value cannot exceed maximum marks.',
        400
      );
    }

    const existing =
      await tx.examinationGradingConfiguration.findFirst({
        where: {
          examinationId,
          schoolId
        }
      });

    if (existing) {
      throw new AppError(
        'A grading configuration already exists for this examination.',
        409
      );
    }

    return tx.examinationGradingConfiguration.create({
      data: {
        schoolId,
        examinationId,
        ...input
      }
    });
  });
};

export const getExaminationGradingConfiguration = async (
  schoolId: string,
  examinationId: string
) => {
  const examination = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      schoolId
    },
    include: {
      gradingConfiguration: true
    }
  });

  if (!examination) {
    throw new AppError('Examination not found.', 404);
  }

  return examination.gradingConfiguration;
};

export const updateExaminationGradingConfiguration = async (
  schoolId: string,
  examinationId: string,
  input: UpdateGradingInput
) => {
  return prisma.$transaction(async (tx) => {
    const examination = await tx.examination.findFirst({
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
        'Grading configuration cannot be changed after scheduling.',
        409
      );
    }

    const existing =
      await tx.examinationGradingConfiguration.findFirst({
        where: {
          examinationId,
          schoolId
        }
      });

    if (!existing) {
      throw new AppError(
        'Examination grading configuration not found.',
        404
      );
    }

    const maximumMarks =
      input.maximumMarks ?? Number(existing.maximumMarks);

    const passingMarks =
      input.passingMarks ?? Number(existing.passingMarks);

    if (passingMarks > maximumMarks) {
      throw new AppError(
        'Passing marks cannot exceed maximum marks.',
        400
      );
    }

    if (maximumMarks !== Number(examination.totalMarks)) {
      throw new AppError(
        'Maximum marks must match the examination total marks.',
        400
      );
    }

    return tx.examinationGradingConfiguration.update({
      where: {
        examinationId_schoolId: {
          examinationId,
          schoolId
        }
      },
      data: input
    });
  });
};
