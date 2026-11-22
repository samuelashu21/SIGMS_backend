
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const archiveUser = async (
  userId: string,
  archivedBy: string
) => {
  if (userId === archivedBy) {
    throw new AppError('You cannot archive your own account.', 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null
    },
    select: { id: true, isActive: true }
  });

  if (!user) {
    throw new AppError('User not found or already archived.', 404);
  }

  return prisma.$transaction(async (tx) => {
    const archived = await tx.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        deletedAt: true
      }
    });

    await tx.authSession.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    return archived;
  });
};
