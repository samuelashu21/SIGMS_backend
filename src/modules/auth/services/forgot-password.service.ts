
import { randomBytes, createHash } from 'node:crypto';

import { prisma } from '../../../database/index.js';
import { sendPasswordResetEmail } from '../../../services/email.service.js';

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const requestPasswordReset = async (
  email: string
): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      isActive: true
    }
  });

  // Do not reveal whether an account exists.
  if (!user) return;

  const resetToken = randomBytes(32).toString('hex');
  const tokenHash = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null }
    });

    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });
  });

  if (user.email) {
    await sendPasswordResetEmail(user.email, resetToken);
  }
};
