
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  UpdateSchoolSettingsPayload
} from '../validators/school-settings.validator.js';

export const getSchoolSettings = async (schoolId: string) => {
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

export const updateSchoolSettings = async (
  schoolId: string,
  input: UpdateSchoolSettingsPayload
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
