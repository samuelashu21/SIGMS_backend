
import type {
  Request,
  Response,
  NextFunction
} from 'express';

import type { Permission } from '../types/permission.types.js';
import { ROLE_PERMISSIONS } from '../permissions/role-permissions.js';
import { AppError } from '../../../utils/app-error.js';

export const authorizePermissions = (
  ...requiredPermissions: Permission[]
) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.auth) {
      return next(new AppError('Authentication required.', 401));
    }

    const userPermissions = ROLE_PERMISSIONS[req.auth.role];

    const hasPermissions = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (!hasPermissions) {
      return next(
        new AppError('Insufficient permissions.', 403)
      );
    }

    next();
  };
};
