
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { CreateSchoolPayload } from '../validators/create-school.validator.js';
import type { UpdateSchoolPayload } from '../validators/update-school.validator.js';

/**
 * Register a new school.
 */
export const registerSchool = async (
  input: CreateSchoolPayload
) => {
  const schoolCode = input.schoolCode.trim().toUpperCase();

  // Check whether school code already exists.
  const existingSchool = await prisma.school.findUnique({
    where: { schoolCode },
    select: { id: true }
  });

  if (existingSchool) {
    throw new AppError('School code is already registered.', 409);
  }

  // Create school.
  return prisma.school.create({
    data: {
      name: input.name.trim(),
      schoolCode,
      schoolType: input.schoolType,
      region: input.region,
      zone: input.zone,
      woreda: input.woreda,
      city: input.city,
      address: input.address,
      phone: input.phone,
      email: input.email?.toLowerCase()
    }
  });
};

/**
 * Retrieve school profile.
 */
export const getSchoolProfile = async (
  schoolId: string
) => {
  const school = await prisma.school.findUnique({
    where: { id: schoolId }
  });

  if (!school) {
    throw new AppError('School not found.', 404);
  }

  return school;
};

/**
 * Update school profile.
 */
export const updateSchoolProfile = async (
  schoolId: string,
  input: UpdateSchoolPayload
) => {
  // Verify school exists.
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true }
  });

  if (!school) {
    throw new AppError('School not found.', 404);
  }

  // Update school information.
  return prisma.school.update({
    where: { id: schoolId },
    data: {
      ...input,
      ...(input.email !== undefined && {
        email: input.email?.toLowerCase() ?? null
      })
    }
  });
};
