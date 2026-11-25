
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  createStudentGuardianSchema
} from '../validators/student-guardian.validator.js';

type CreateInput = z.infer<typeof createStudentGuardianSchema>;

export const createStudentGuardianRelationship = async (
  schoolId: string,
  input: CreateInput
) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: {
        id: input.studentId,
        schoolId
      },
      select: { id: true }
    });

    if (!student) {
      throw new AppError('Student not found in this school.', 404);
    }

    const guardian = await tx.guardianProfile.findFirst({
      where: {
        id: input.guardianId,
        schoolId,
        isActive: true
      },
      select: { id: true }
    });

    if (!guardian) {
      throw new AppError('Active guardian profile not found.', 404);
    }

    const existing = await tx.studentGuardianRelationship.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        guardianId: input.guardianId
      },
      select: { id: true }
    });

    if (existing) {
      throw new AppError(
        'This guardian is already linked to the student.',
        409
      );
    }

    return tx.studentGuardianRelationship.create({
      data: {
        schoolId,
        studentId: input.studentId,
        guardianId: input.guardianId,
        relationshipType: input.relationshipType,
        isPrimary: input.isPrimary,
        status: 'PENDING'
      },
      include: {
        student: true,
        guardian: true
      }
    });
  });
};

export const getStudentGuardianRelationships = async (
  schoolId: string,
  studentId: string
) => {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      schoolId
    },
    select: { id: true }
  });

  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  return prisma.studentGuardianRelationship.findMany({
    where: {
      schoolId,
      studentId
    },
    include: {
      guardian: {
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
      },
      verifiedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getGuardianStudentRelationships = async (
  schoolId: string,
  guardianId: string
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

  return prisma.studentGuardianRelationship.findMany({
    where: {
      schoolId,
      guardianId
    },
    include: {
      student: {
        include: {
          profile: true
        }
      },
      verifiedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};
