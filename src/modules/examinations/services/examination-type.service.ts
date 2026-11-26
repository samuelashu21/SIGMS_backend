
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  createExaminationTypeSchema,
  updateExaminationTypeSchema
} from '../validators/examination-type.validator.js';

type CreateInput = z.infer<typeof createExaminationTypeSchema>;
type UpdateInput = z.infer<typeof updateExaminationTypeSchema>;

export const createExaminationType = async (
  schoolId: string,
  input: CreateInput
) => {
  const existing = await prisma.examinationTypeConfiguration.findUnique({
    where: {
      schoolId_code: {
        schoolId,
        code: input.code
      }
    }
  });

  if (existing) {
    throw new AppError('Examination type code already exists.', 409);
  }

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.examinationTypeConfiguration.updateMany({
        where: { schoolId },
        data: { isDefault: false }
      });
    }

    return tx.examinationTypeConfiguration.create({
      data: {
        schoolId,
        name: input.name,
        code: input.code,
        description: input.description,
        isDefault: input.isDefault
      }
    });
  });
};

export const getExaminationTypes = async (
  schoolId: string,
  includeInactive = false
) => {
  return prisma.examinationTypeConfiguration.findMany({
    where: {
      schoolId,
      ...(includeInactive ? {} : { isActive: true })
    },
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' }
    ]
  });
};

export const updateExaminationType = async (
  schoolId: string,
  typeId: string,
  input: UpdateInput
) => {
  const existing = await prisma.examinationTypeConfiguration.findFirst({
    where: {
      id: typeId,
      schoolId
    }
  });

  if (!existing) {
    throw new AppError('Examination type not found.', 404);
  }

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.examinationTypeConfiguration.updateMany({
        where: { schoolId },
        data: { isDefault: false }
      });
    }

    return tx.examinationTypeConfiguration.update({
      where: { id: typeId },
      data: input
    });
  });
};

export const deleteExaminationType = async (
  schoolId: string,
  typeId: string
) => {
  const existing = await prisma.examinationTypeConfiguration.findFirst({
    where: {
      id: typeId,
      schoolId
    }
  });

  if (!existing) {
    throw new AppError('Examination type not found.', 404);
  }

  return prisma.examinationTypeConfiguration.update({
    where: { id: typeId },
    data: {
      isActive: false,
      isDefault: false
    }
  });
};
