
import {
  generateRefreshToken,
  verifyRefreshToken
} from './index.js';

import { hashRefreshToken } from './session-token.service.js';
import { prisma } from '../../../database/index.js';
import type { UserRole } from '../types/auth.types.js';

interface CreateSessionInput {
  userId: string;
  schoolId?: string;
  role: UserRole;
}

export const createAuthSession = async (
  input: CreateSessionInput
) => {
  return prisma.$transaction(async (tx) => {
    const session = await tx.authSession.create({
      data: {
        userId: input.userId,
        schoolId: input.schoolId,
        tokenHash: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    const refreshToken = generateRefreshToken({
      sub: input.userId,
      sessionId: session.id,
      role: input.role,
      schoolId: input.schoolId
    });

    const decoded = verifyRefreshToken(refreshToken);
    const expiresAt = new Date(
      (decoded.exp as number) * 1000
    );

    await tx.authSession.update({
      where: { id: session.id },
      data: {
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt
      }
    });

    return {
      sessionId: session.id,
      refreshToken,
      expiresAt
    };
  });
};

export const revokeAuthSession = async (
  sessionId: string,
  userId: string
) => {
  return prisma.authSession.updateMany({
    where: {
      id: sessionId,
      userId,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};
