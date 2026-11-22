
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import { comparePassword, hashPassword } from './password.service.js';

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
  currentSessionId: string;
}

export const changeUserPassword = async (
  input: ChangePasswordInput
) => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId }
  });

  if (!user || !user.isActive) {
    throw new AppError('User account not found.', 404);
  }

  const matches = await comparePassword(
    input.currentPassword,
    user.passwordHash
  );

  if (!matches) {
    throw new AppError('Current password is incorrect.', 401);
  }

  if (input.currentPassword === input.newPassword) {
    throw new AppError(
      'New password must be different from the current password.',
      400
    );
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: input.userId },
      data: { passwordHash }
    }),
    prisma.authSession.updateMany({
      where: {
        userId: input.userId,
        id: { not: input.currentSessionId },
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    })
  ]);

  return {
    message: 'Password changed successfully.'
  };
};
