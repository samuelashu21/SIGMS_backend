
import type {
  Request,
  Response,
  NextFunction
} from 'express';

import type { UserRole } from '../types/auth.types.js';
import { AppError } from '../../../utils/app-error.js';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.auth) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(
        new AppError('You are not authorized to access this resource.', 403)
      );
    }

    next();
  };
};
