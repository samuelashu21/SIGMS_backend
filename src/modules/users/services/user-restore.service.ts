
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';
import { recordUserActivity } from './user-activity.service.js';

export const restoreUser = async (
  userId: string,
  restoredBy: string
) => {
  // 1. Check whether the user exists and is archived
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: {
        not: null
      }
    },
    select: {
      id: true
    }
  });

  if (!user) {
    throw new AppError('Archived user not found.', 404);
  }

  // 2. Restore user and record activity atomically
  return prisma.$transaction(async (tx) => {
    // Restore archived user
    const restored = await tx.user.update({
      where: {
        id: userId
      },
      data: {
        deletedAt: null,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        deletedAt: true,
        updatedAt: true
      }
    });

    // Record restoration activity using transaction client
    await recordUserActivity(
      {
        actorId: restoredBy,
        targetUserId: userId,
        action: 'USER_RESTORED',
        details: {
          isActive: true
        }
      },
      tx
    );

    return restored;
  });
};
