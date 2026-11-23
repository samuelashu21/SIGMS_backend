
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';
import { hashPassword } from '../../auth/services/password.service.js';

import type {
  CreateSchoolAdminPayload
} from '../validators/create-school-admin.validator.js';

export const createSchoolAdministrator = async (
  schoolId: string,
  input: CreateSchoolAdminPayload
) => {
  const email = input.email?.trim().toLowerCase();
  const username = input.username?.trim().toLowerCase();

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, isActive: true }
  });

  if (!school || !school.isActive) {
    throw new AppError('Active school not found.', 404);
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : [])
      ]
    },
    select: { id: true }
  });

  if (existingUser) {
    throw new AppError(
      'Email or username is already registered.',
      409
    );
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        username,
        passwordHash,
        role: 'SCHOOL_ADMIN'
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    const membership = await tx.userSchoolMembership.create({
      data: {
        userId: user.id,
        schoolId,
        role: 'SCHOOL_ADMIN'
      }
    });

    return { user, membership };
  });
};
