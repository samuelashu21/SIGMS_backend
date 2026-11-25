
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  z
} from 'zod';

import {
  createStaffProfileSchema,
  updateStaffProfileSchema
} from '../validators/staff-profile.validator.js';

type CreateStaffInput = z.infer<
  typeof createStaffProfileSchema
>;

type UpdateStaffInput = z.infer<
  typeof updateStaffProfileSchema
>;

const STAFF_ROLES = [
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'REGISTRAR'
] as const;

export const createStaffProfile = async (
  schoolId: string,
  input: CreateStaffInput
) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        id: input.userId,
        role: { in: [...STAFF_ROLES] },
        isActive: true,
        deletedAt: null
      },
      select: { id: true }
    });

    if (!user) {
      throw new AppError(
        'Active non-teaching staff user account not found.',
        404
      );
    }

    const membership = await tx.userSchoolMembership.findFirst({
      where: {
        userId: input.userId,
        schoolId,
        isActive: true,
        role: { in: [...STAFF_ROLES] }
      },
      select: { id: true }
    });

    if (!membership) {
      throw new AppError(
        'User does not have an eligible active staff membership in this school.',
        403
      );
    }

    const existing = await tx.staffProfile.findFirst({
      where: {
        schoolId,
        OR: [
          { userId: input.userId },
          { employeeNumber: input.employeeNumber }
        ]
      },
      select: { id: true }
    });

    if (existing) {
      throw new AppError(
        'Staff profile or employee number already exists.',
        409
      );
    }

    return tx.staffProfile.create({
      data: {
        schoolId,
        userId: input.userId,
        employeeNumber: input.employeeNumber,
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        category: input.category,
        designation: input.designation,
        department: input.department,
        phoneNumber: input.phoneNumber,
        email: input.email,
        address: input.address,
        hireDate: new Date(`${input.hireDate}T00:00:00.000Z`)
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

export const getStaffProfiles = async (
  schoolId: string,
  search?: string,
  category?: CreateStaffInput['category']
) => {
  return prisma.staffProfile.findMany({
    where: {
      schoolId,
      ...(category && { category }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { middleName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { employeeNumber: { contains: search, mode: 'insensitive' } },
          { designation: { contains: search, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          role: true,
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

export const getStaffProfile = async (
  schoolId: string,
  staffId: string
) => {
  const staff = await prisma.staffProfile.findFirst({
    where: {
      id: staffId,
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

  if (!staff) {
    throw new AppError('Staff profile not found.', 404);
  }

  return staff;
};

export const updateStaffProfile = async (
  schoolId: string,
  staffId: string,
  input: UpdateStaffInput
) => {
  const staff = await prisma.staffProfile.findFirst({
    where: {
      id: staffId,
      schoolId
    },
    select: { id: true, hireDate: true }
  });

  if (!staff) {
    throw new AppError('Staff profile not found.', 404);
  }

  const { terminationDate, ...fields } = input;

  if (fields.employmentStatus === 'TERMINATED' &&
      terminationDate === undefined) {
    throw new AppError(
      'Termination date is required when terminating staff.',
      400
    );
  }

  return prisma.staffProfile.update({
    where: { id: staffId },
    data: {
      ...fields,
      ...(terminationDate !== undefined && {
        terminationDate: terminationDate
          ? new Date(`${terminationDate}T00:00:00.000Z`)
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
