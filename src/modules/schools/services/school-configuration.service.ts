
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  UpdateSchoolConfigurationPayload
} from '../validators/school-configuration.validator.js';

export const getSchoolConfiguration = async (
  schoolId: string
) => {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true }
  });

  if (!school) {
    throw new AppError('School not found.', 404);
  }

  return prisma.schoolConfiguration.upsert({
    where: { schoolId },
    create: { schoolId },
    update: {}
  });
};

export const updateSchoolConfiguration = async (
  schoolId: string,
  input: UpdateSchoolConfigurationPayload
) => {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true }
  });

  if (!school) {
    throw new AppError('School not found.', 404);
  }

  return prisma.schoolConfiguration.upsert({
    where: { schoolId },
    create: {
      schoolId,
      ...input
    },
    update: input
  });
};
