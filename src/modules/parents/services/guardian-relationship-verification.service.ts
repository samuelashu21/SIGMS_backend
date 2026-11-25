
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  verifyGuardianRelationshipSchema
} from '../validators/guardian-relationship-verification.validator.js';

type VerificationInput = z.infer<
  typeof verifyGuardianRelationshipSchema
>;

export const verifyStudentGuardianRelationship = async (
  schoolId: string,
  relationshipId: string,
  verifiedById: string,
  input: VerificationInput
) => {
  return prisma.$transaction(async (tx) => {
    const relationship = await tx.studentGuardianRelationship.findFirst({
      where: {
        id: relationshipId,
        schoolId
      }
    });

    if (!relationship) {
      throw new AppError('Guardian relationship not found.', 404);
    }

    if (relationship.status !== 'PENDING') {
      throw new AppError(
        'Only pending relationships can be reviewed.',
        409
      );
    }

    const reviewer = await tx.user.findFirst({
      where: {
        id: verifiedById,
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (!reviewer) {
      throw new AppError('Active reviewer account not found.', 404);
    }

    const updatedRelationship =
      await tx.studentGuardianRelationship.update({
        where: {
          id: relationshipId
        },
        data: {
          status: input.decision,
          verificationNotes: input.verificationNotes,
          verifiedAt: new Date(),
          verifiedById
        },
        include: {
          student: true,
          guardian: true
        }
      });

    if (input.decision === 'VERIFIED') {
      await tx.guardianPermission.upsert({
        where: {
          relationshipId
        },
        create: {
          schoolId,
          relationshipId
        },
        update: {}
      });
    }

    return updatedRelationship;
  });
};

export const getPendingGuardianRelationships = async (
  schoolId: string
) => {
  return prisma.studentGuardianRelationship.findMany({
    where: {
      schoolId,
      status: 'PENDING'
    },
    include: {
      student: true,
      guardian: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
};
