
import type {
  Request,
  Response,
  NextFunction,
  RequestHandler
} from 'express';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  UserRole
} from '../../auth/types/auth.types.js';

export const requireSchoolMembership: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth) {
      throw new AppError('Authentication required.', 401);
    }

    const schoolId =
      req.params.schoolId ||
      req.header('x-school-id');

    if (!schoolId) {
      throw new AppError('School context is required.', 400);
    }

    const userId = req.auth.sub;

    if (req.auth.role === 'SUPER_ADMIN') {
      const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: { id: true, isActive: true }
      });

      if (!school || !school.isActive) {
        throw new AppError('Active school not found.', 404);
      }

      req.schoolContext = {
        schoolId,
        userId,
        role: 'SUPER_ADMIN'
      };

      return next();
    }

    const membership = await prisma.userSchoolMembership.findFirst({
      where: {
        userId,
        schoolId,
        isActive: true,
        school: {
          isActive: true
        },
        user: {
          isActive: true,
          deletedAt: null
        }
      },
      select: {
        schoolId: true,
        role: true
      }
    });

    if (!membership) {
      throw new AppError(
        'You do not have an active membership in this school.',
        403
      );
    }

    req.schoolContext = {
      schoolId: membership.schoolId,
      userId,
      role: membership.role as UserRole
    };

    return next();
  } catch (error) {
    next(error);
  }
};

export const authorizeSchoolRoles = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (req, _res, next) => {
    if (!req.schoolContext) {
      return next(
        new AppError('School authorization context is missing.', 403)
      );
    }

    if (!allowedRoles.includes(req.schoolContext.role)) {
      return next(
        new AppError(
          'You are not authorized to perform this school operation.',
          403
        )
      );
    }

    next();
  };
};
