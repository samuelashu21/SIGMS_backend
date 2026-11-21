
import {
  generateAccessToken,
  generateRefreshToken
} from './token.service.js';

import { verifyRefreshToken } from './token-verification.service.js';
import { hashRefreshToken } from './session-token.service.js';
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const refreshAuthSession = async (token: string) => {
  const payload = verifyRefreshToken(token);

  return prisma.$transaction(async (tx) => {
    const session = await tx.authSession.findUnique({
      where: { id: payload.sessionId }
    });

    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.tokenHash !== hashRefreshToken(token)
    ) {
      throw new AppError('Refresh session is invalid or expired.', 401);
    }

    const newRefreshToken = generateRefreshToken({
      sub: payload.sub,
      sessionId: payload.sessionId,
      role: payload.role,
      schoolId: payload.schoolId
    });

    const newPayload = verifyRefreshToken(newRefreshToken);

    await tx.authSession.update({
      where: { id: session.id },
      data: {
        tokenHash: hashRefreshToken(newRefreshToken),
        expiresAt: new Date((newPayload.exp as number) * 1000)
      }
    });

    const accessToken = generateAccessToken({
      sub: payload.sub,
      sessionId: payload.sessionId,
      role: payload.role,
      schoolId: payload.schoolId
    });

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  });
};
