
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateTeacherProfileInput,
  UpdateTeacherProfileInput
} from '../validators/teacher-profile.validator.js';

export const createTeacherProfile = async (
  schoolId: string,
  input: CreateTeacherProfileInput
) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        id: input.userId,
        role: 'TEACHER',
        isActive: true,
        deletedAt: null
      }
    });

    if (!user) {
      throw new AppError(
        'Active teacher user account not found.',
        404
      );
    }

    const membership = await tx.userSchoolMembership.findFirst({
      where: {
        userId: input.userId,
        schoolId,
        role: 'TEACHER',
        isActive: true
      }
    });

    if (!membership) {
      throw new AppError(
        'Teacher does not have an active membership in this school.',
        403
      );
    }

    const existing = await tx.teacherProfile.findUnique({
      where: {
        schoolId_userId: {
          schoolId,
          userId: input.userId
        }
      }
    });

    if (existing) {
      throw new AppError(
        'Teacher profile already exists in this school.',
        409
      );
    }

    return tx.teacherProfile.create({
      data: {
        schoolId,
        userId: input.userId,
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth
          ? new Date(`${input.dateOfBirth}T00:00:00.000Z`)
          : undefined,
        phoneNumber: input.phoneNumber,
        email: input.email,
        address: input.address,
        city: input.city,
        region: input.region
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
      }
    });
  });
};

export const getTeacherProfile = async (
  schoolId: string,
  teacherId: string
) => {
  const teacher = await prisma.teacherProfile.findFirst({
    where: {
      id: teacherId,
      schoolId
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          isActive: true
        }
      },
      employmentRecords: {
        orderBy: { startDate: 'desc' }
      }
    }
  });

  if (!teacher) {
    throw new AppError('Teacher profile not found.', 404);
  }

  return teacher;
};

export const getTeachers = async (
  schoolId: string,
  search?: string
) => {
  return prisma.teacherProfile.findMany({
    where: {
      schoolId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { middleName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } }
        ]
      })
    },
    include: {
      user: {
        select: {
          id: true,
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

export const updateTeacherProfile = async (
  schoolId: string,
  teacherId: string,
  input: UpdateTeacherProfileInput
) => {
  const teacher = await prisma.teacherProfile.findFirst({
    where: {
      id: teacherId,
      schoolId
    }
  });

  if (!teacher) {
    throw new AppError('Teacher profile not found.', 404);
  }

  const { dateOfBirth, ...fields } = input;

  await prisma.teacherProfile.updateMany({
    where: {
      id: teacherId,
      schoolId
    },
    data: {
      ...fields,
      ...(dateOfBirth !== undefined && {
        dateOfBirth: dateOfBirth
          ? new Date(`${dateOfBirth}T00:00:00.000Z`)
          : null
      })
    }
  });

  return prisma.teacherProfile.findFirstOrThrow({
    where: {
      id: teacherId,
      schoolId
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
    }
  });
};
