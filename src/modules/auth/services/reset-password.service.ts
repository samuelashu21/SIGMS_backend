
import { createHash } from 'node:crypto';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import { hashPassword } from './password.service.js';

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const resetUserPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const tokenHash = hashToken(token);
  const now = new Date();
  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction(async (tx) => {
    const resetRecord = await tx.passwordResetToken.findUnique({
      where: { tokenHash }
    });

    if (
      !resetRecord ||
      resetRecord.usedAt ||
      resetRecord.expiresAt <= now
    ) {
      throw new AppError('Password reset link is invalid or expired.', 400);
    }

    // Claim the token once to prevent concurrent reuse.
    const claimed = await tx.passwordResetToken.updateMany({
      where: {
        id: resetRecord.id,
        usedAt: null,
        expiresAt: { gt: now }
      },
      data: { usedAt: now }
    });

    if (claimed.count !== 1) {
      throw new AppError('Password reset link is invalid or expired.', 400);
    }

    await tx.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash }
    });

    await tx.authSession.updateMany({
      where: {
        userId: resetRecord.userId,
        revokedAt: null
      },
      data: { revokedAt: now }
    });

    await tx.passwordResetToken.deleteMany({
      where: {
        userId: resetRecord.userId,
        id: { not: resetRecord.id }
      }
    });
  });
};
