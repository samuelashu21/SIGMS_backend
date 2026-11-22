
import { prisma } from '../../../database/index.js';

export const revokeAllUserSessions = async (userId: string) => {
  return prisma.authSession.updateMany({
    where: {
      userId,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};
