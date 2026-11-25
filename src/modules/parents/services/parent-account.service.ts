
import bcrypt from 'bcryptjs';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  createParentAccountSchema
} from '../validators/parent-account.validator.js';

type CreateParentInput = z.infer<
  typeof createParentAccountSchema
>;

export const createParentAccount = async (
  schoolId: string,
  input: CreateParentInput
) => {
  const email = input.email?.trim().toLowerCase();
  const username = input.username?.trim().toLowerCase();

  const passwordHash = await bcrypt.hash(input.password, 12);

  return prisma.$transaction(async (tx) => {
    if (email) {
      const existingEmail = await tx.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existingEmail) {
        throw new AppError('Email is already registered.', 409);
      }
    }

    if (username) {
      const existingUsername = await tx.user.findUnique({
        where: { username },
        select: { id: true }
      });

      if (existingUsername) {
        throw new AppError('Username is already registered.', 409);
      }
    }

    const school = await tx.school.findUnique({
      where: { id: schoolId },
      select: { id: true, isActive: true }
    });

    if (!school || !school.isActive) {
      throw new AppError('Active school not found.', 404);
    }

    const user = await tx.user.create({
      data: {
        email,
        username,
        passwordHash,
        role: 'PARENT',
        isActive: true
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
        role: 'PARENT',
        isActive: true
      }
    });

    return {
      user,
      membership
    };
  });
};
