
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  updateGuardianPermissionSchema
} from '../validators/guardian-permission.validator.js';

type UpdateInput = z.infer<
  typeof updateGuardianPermissionSchema
>;

export const getGuardianPermissions = async (
  schoolId: string,
  relationshipId: string
) => {
  const relationship =
    await prisma.studentGuardianRelationship.findFirst({
      where: {
        id: relationshipId,
        schoolId,
        status: 'VERIFIED'
      },
      include: {
        permission: true
      }
    });

  if (!relationship) {
    throw new AppError(
      'Verified guardian relationship not found.',
      404
    );
  }

  return relationship.permission;
};

export const updateGuardianPermissions = async (
  schoolId: string,
  relationshipId: string,
  input: UpdateInput
) => {
  return prisma.$transaction(async (tx) => {
    const relationship =
      await tx.studentGuardianRelationship.findFirst({
        where: {
          id: relationshipId,
          schoolId,
          status: 'VERIFIED'
        },
        select: {
          id: true
        }
      });

    if (!relationship) {
      throw new AppError(
        'Verified guardian relationship not found.',
        404
      );
    }

    return tx.guardianPermission.upsert({
      where: {
        relationshipId
      },
      create: {
        schoolId,
        relationshipId,
        ...input
      },
      update: input
    });
  });
};
