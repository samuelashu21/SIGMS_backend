
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import { hashPassword } from '../../auth/services/password.service.js';
import type { CreateUserPayload } from '../validators/create-user.validator.js';
import type { UserQuery } from '../validators/user-query.validator.js';
import type { UpdateUserPayload } from '../validators/update-user.validator.js';


export const createUser = async (input: CreateUserPayload) => {
  const email = input.email?.trim().toLowerCase();
  const username = input.username?.trim().toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : [])
      ]
    },
    select: { id: true }
  });

  if (existingUser) {
    throw new AppError(
      'A user with this email or username already exists.',
      409
    );
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      role: input.role
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
};


export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      deletedAt: null
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};


export const getUsers = async (query: UserQuery) => {
  const {
    page,
    limit,
    search,
    role,
    isActive
  } = query;

  const where = {
    deletedAt: null,
    ...(role && { role }),
    ...(isActive !== undefined && {
      isActive: isActive === 'true'
    }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { username: { contains: search, mode: 'insensitive' as const } }
      ]
    })
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};


export const updateUserProfile = async (
  userId: string,
  input: UpdateUserPayload
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const email = input.email?.trim().toLowerCase() ?? input.email;
  const username = input.username?.trim().toLowerCase() ?? input.username;

  const existingUser = await prisma.user.findFirst({
    where: {
      id: { not: userId },
      OR: [
        ...(email ? [{ email }] : []),
        ...(username ? [{ username }] : [])
      ]
    },
    select: { id: true }
  });

  if (existingUser) {
    throw new AppError(
      'Email or username is already assigned to another user.',
      409
    );
  }

  return prisma.user.update({
    where: { id: userId },
    data: { email, username },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
};


export const updateUserStatus = async (
  userId: string,
  isActive: boolean
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true }
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!isActive) {
      await tx.authSession.updateMany({
        where: {
          userId,
          revokedAt: null
        },
        data: {
          revokedAt: new Date()
        }
      });
    }

    return updated;
  });

  return updatedUser;
};
