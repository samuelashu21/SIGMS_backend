
import type {
  Request,
  Response,
  NextFunction,
  RequestHandler
} from 'express';

import { AppError } from '../../../utils/app-error.js';

export const tenantIsolationMiddleware: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const context = req.schoolContext;

  if (!context) {
    return next(
      new AppError('School authorization context is required.', 403)
    );
  }

  const requestedSchoolIds = [
    req.params.schoolId,
    req.query.schoolId,
    req.body?.schoolId,
    req.header('x-school-id')
  ].filter(
    (value): value is string => typeof value === 'string'
  );

  const hasForeignSchool = requestedSchoolIds.some(
    (schoolId) => schoolId !== context.schoolId
  );

  if (hasForeignSchool) {
    return next(
      new AppError(
        'Cross-school data access is not permitted.',
        403
      )
    );
  }

  req.tenant = {
    schoolId: context.schoolId,
    userId: context.userId,
    role: context.role
  };

  next();
};
