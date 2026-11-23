
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { CreateSchoolPayload } from '../validators/create-school.validator.js';

export const registerSchool = async (
  input: CreateSchoolPayload
) => {
  const schoolCode = input.schoolCode.trim().toUpperCase();

  const existingSchool = await prisma.school.findUnique({
    where: { schoolCode },
    select: { id: true }
  });

  if (existingSchool) {
    throw new AppError('School code is already registered.', 409);
  }

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
