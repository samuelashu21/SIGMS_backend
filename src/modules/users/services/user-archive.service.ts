
import type { Prisma } from '../../../generated/prisma/client.js';
import { prisma } from '../../../database/index.js';

interface RecordUserActivityInput {
  actorId: string;
  targetUserId: string;
  action: string;
  details?: Prisma.InputJsonValue;
}

export const recordUserActivity = (
  input: RecordUserActivityInput,
  tx: Prisma.TransactionClient
) => {
  return tx.userActivityLog.create({
    data: {
      actorId: input.actorId,
      targetUserId: input.targetUserId,
      action: input.action,
      ...(input.details !== undefined && {
        details: input.details
      })
    }
  });
};

export const getUserActivityHistory = async (
  userId: string,
  page = 1,
  limit = 20
) => {
  const currentPage = Math.max(1, Math.floor(page));
  const pageSize = Math.min(100, Math.max(1, Math.floor(limit)));

  const [activities, total] = await prisma.$transaction([
    prisma.userActivityLog.findMany({
      where: {
        targetUserId: userId
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize
    }),

    prisma.userActivityLog.count({
      where: {
        targetUserId: userId
      }
    })
  ]);

  return {
    activities,
    pagination: {
      page: currentPage,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};
