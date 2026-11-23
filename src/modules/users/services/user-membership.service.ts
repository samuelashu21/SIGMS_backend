
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateMembershipPayload
} from '../validators/user-membership.validator.js';

export const createUserMembership = async (
  userId: string,
  input: CreateMembershipPayload
) => {
  const [user, school] = await Promise.all([
    prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        isActive: true
      },
      select: { id: true }
    }),
    prisma.school.findUnique({
      where: { id: input.schoolId },
      select: { id: true }
    })
  ]);

  if (!user) {
    throw new AppError('Active user not found.', 404);
  }

  if (!school) {
    throw new AppError('School not found.', 404);
  }

  const existing = await prisma.userSchoolMembership.findUnique({
    where: {
      userId_schoolId: {
        userId,
        schoolId: input.schoolId
      }
    }
  });

  if (existing) {
    throw new AppError(
      'User already has a membership in this school.',
      409
    );
  }

  return prisma.userSchoolMembership.create({
    data: {
      userId,
      schoolId: input.schoolId,
      role: input.role
    }
  });
};

export const getUserMemberships = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null
    },
    select: { id: true }
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return prisma.userSchoolMembership.findMany({
    where: { userId },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          isActive: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};
