
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import { USER_ROLES } from '../../auth/types/auth.types.js';

export const getRoleCatalogue = () => {
  return USER_ROLES.map((role) => ({
    name: role,
    description: role.replaceAll('_', ' ').toLowerCase()
  }));
};

export const assignUserRole = async (
  userId: string,
  role: (typeof USER_ROLES)[number]
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
};
