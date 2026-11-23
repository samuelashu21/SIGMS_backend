
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  UpdateSchoolMembershipPayload
} from '../validators/update-school-membership.validator.js';

export const getSchoolMemberships = async (schoolId: string) => {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true }
  });

  if (!school) {
    throw new AppError('School not found.', 404);
  }

  return prisma.userSchoolMembership.findMany({
    where: { schoolId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateSchoolMembership = async (
  schoolId: string,
  membershipId: string,
  input: UpdateSchoolMembershipPayload
) => {
  const membership = await prisma.userSchoolMembership.findFirst({
    where: {
      id: membershipId,
      schoolId
    },
    select: { id: true }
  });

  if (!membership) {
    throw new AppError('School membership not found.', 404);
  }

  return prisma.userSchoolMembership.update({
    where: { id: membershipId },
    data: input,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true
        }
      }
    }
  });
};
