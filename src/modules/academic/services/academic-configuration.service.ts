
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  AcademicConfigurationInput
} from '../validators/academic-configuration.validator.js';

export const getAcademicConfiguration = async (
  schoolId: string
) => {
  const configuration = await prisma.academicConfiguration.findUnique({
    where: { schoolId }
  });

  if (!configuration) {
    throw new AppError('Academic configuration not found.', 404);
  }

  return configuration;
};

export const createAcademicConfiguration = async (
  schoolId: string
) => {
  const existing = await prisma.academicConfiguration.findUnique({
    where: { schoolId }
  });

  if (existing) {
    throw new AppError('Academic configuration already exists.', 409);
  }

  return prisma.academicConfiguration.create({
    data: { schoolId }
  });
};

export const updateAcademicConfiguration = async (
  schoolId: string,
  input: AcademicConfigurationInput
) => {
  const existing = await prisma.academicConfiguration.findUnique({
    where: { schoolId }
  });

  if (!existing) {
    throw new AppError('Academic configuration not found.', 404);
  }

  return prisma.academicConfiguration.update({
    where: { schoolId },
    data: input
  });
};
