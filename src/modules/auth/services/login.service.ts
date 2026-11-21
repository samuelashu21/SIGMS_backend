
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import { comparePassword } from './password.service.js';
import { createAuthSession } from './session.service.js';
import { generateAccessToken } from './token.service.js';

import type { UserRole } from '../types/auth.types.js';
import type { LoginInput } from '../validators/login.validator.js';

export const loginUser = async (input: LoginInput) => {
  const identifier = input.identifier.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });

  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials.', 401);
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError('Invalid credentials.', 401);
  }

  const session = await createAuthSession({
    userId: user.id,
    role: user.role as UserRole
  });

  const accessToken = generateAccessToken({
    sub: user.id,
    sessionId: session.sessionId,
    role: user.role as UserRole
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt
  };
};
