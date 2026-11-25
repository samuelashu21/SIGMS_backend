
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  createGuardianContactSchema,
  updateGuardianContactSchema
} from '../validators/guardian-contact.validator.js';

type CreateInput = z.infer<typeof createGuardianContactSchema>;
type UpdateInput = z.infer<typeof updateGuardianContactSchema>;

export const createGuardianContact = async (
  schoolId: string,
  guardianId: string,
  input: CreateInput
) => {
  return prisma.$transaction(async (tx) => {
    const guardian = await tx.guardianProfile.findFirst({
      where: {
        id: guardianId,
        schoolId,
        isActive: true
      },
      select: { id: true }
    });

    if (!guardian) {
      throw new AppError('Active guardian profile not found.', 404);
    }

    if (input.isPrimary) {
      await tx.guardianContact.updateMany({
        where: {
          schoolId,
          guardianId,
          isPrimary: true
        },
        data: { isPrimary: false }
      });
    }

    return tx.guardianContact.create({
      data: {
        schoolId,
        guardianId,
        ...input
      }
    });
  });
};

export const getGuardianContacts = async (
  schoolId: string,
  guardianId: string
) => {
  return prisma.guardianContact.findMany({
    where: {
      schoolId,
      guardianId
    },
    orderBy: [
      { isPrimary: 'desc' },
      { createdAt: 'desc' }
    ]
  });
};

export const updateGuardianContact = async (
  schoolId: string,
  guardianId: string,
  contactId: string,
  input: UpdateInput
) => {
  return prisma.$transaction(async (tx) => {
    const contact = await tx.guardianContact.findFirst({
      where: {
        id: contactId,
        schoolId,
        guardianId
      },
      select: { id: true }
    });

    if (!contact) {
      throw new AppError('Guardian contact not found.', 404);
    }

    if (input.isPrimary) {
      await tx.guardianContact.updateMany({
        where: {
          schoolId,
          guardianId,
          isPrimary: true,
          id: { not: contactId }
        },
        data: { isPrimary: false }
      });
    }

    return tx.guardianContact.update({
      where: { id: contactId },
      data: input
    });
  });
};

export const deleteGuardianContact = async (
  schoolId: string,
  guardianId: string,
  contactId: string
) => {
  const contact = await prisma.guardianContact.findFirst({
    where: {
      id: contactId,
      schoolId,
      guardianId
    },
    select: { id: true }
  });

  if (!contact) {
    throw new AppError('Guardian contact not found.', 404);
  }

  return prisma.guardianContact.update({
    where: { id: contactId },
    data: {
      isActive: false,
      isPrimary: false
    }
  });
};
