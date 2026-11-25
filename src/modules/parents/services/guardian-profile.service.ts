
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  createGuardianProfileSchema,
  updateGuardianProfileSchema
} from '../validators/guardian-profile.validator.js';

type CreateInput = z.infer<typeof createGuardianProfileSchema>;
type UpdateInput = z.infer<typeof updateGuardianProfileSchema>;

export const createGuardianProfile = async (
  schoolId: string,
  input: CreateInput
) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        id: input.userId,
        role: 'PARENT',
        isActive: true,
        deletedAt: null
      },
      select: { id: true }
    });

    if (!user) {
      throw new AppError('Active parent account not found.', 404);
    }

    const membership = await tx.userSchoolMembership.findFirst({
      where: {
        userId: input.userId,
        schoolId,
        role: 'PARENT',
        isActive: true
      },
      select: { id: true }
    });

    if (!membership) {
      throw new AppError(
        'Parent does not have an active membership in this school.',
        403
      );
    }

    const existing = await tx.guardianProfile.findFirst({
      where: {
        schoolId,
        userId: input.userId
      },
      select: { id: true }
    });

    if (existing) {
      throw new AppError(
        'Guardian profile already exists for this account.',
        409
      );
    }

    return tx.guardianProfile.create({
      data: {
        schoolId,
        userId: input.userId,
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth
          ? new Date(`${input.dateOfBirth}T00:00:00.000Z`)
          : null,
        phoneNumber: input.phoneNumber,
        alternatePhone: input.alternatePhone,
        email: input.email,
        occupation: input.occupation,
        address: input.address,
        city: input.city,
        region: input.region,
        preferredLanguage: input.preferredLanguage
      },
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
  });
};

export const getGuardianProfiles = async (
  schoolId: string,
  search?: string
) => {
  return prisma.guardianProfile.findMany({
    where: {
      schoolId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { middleName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true
        }
      }
    },
    orderBy: [
      { firstName: 'asc' },
      { lastName: 'asc' }
    ]
  });
};

export const getGuardianProfile = async (
  schoolId: string,
  guardianId: string
) => {
  const guardian = await prisma.guardianProfile.findFirst({
    where: {
      id: guardianId,
      schoolId
    },
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

  if (!guardian) {
    throw new AppError('Guardian profile not found.', 404);
  }

  return guardian;
};

export const updateGuardianProfile = async (
  schoolId: string,
  guardianId: string,
  input: UpdateInput
) => {
  const guardian = await prisma.guardianProfile.findFirst({
    where: {
      id: guardianId,
      schoolId
    },
    select: { id: true }
  });

  if (!guardian) {
    throw new AppError('Guardian profile not found.', 404);
  }

  const { dateOfBirth, ...fields } = input;

  return prisma.guardianProfile.update({
    where: { id: guardianId },
    data: {
      ...fields,
      ...(dateOfBirth !== undefined && {
        dateOfBirth: dateOfBirth
          ? new Date(`${dateOfBirth}T00:00:00.000Z`)
          : null
      })
    },
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
