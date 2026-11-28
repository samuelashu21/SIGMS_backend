
import type { RequestHandler } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  assertReportAccess,
  type ProtectedReportType
} from '../services/report-access.service.js';

export const requirePublishedReportAccess = (
  reportType: ProtectedReportType,
  parameterName = 'reportId'
): RequestHandler => {
  return asyncHandler(async (req, _res, next) => {
    const schoolId = req.tenant?.schoolId;
    const userId = req.auth?.sub;
    const role = req.auth?.role;
    const reportId = req.params[parameterName];

    if (
      !schoolId ||
      !userId ||
      !role ||
      typeof reportId !== 'string' ||
      !reportId.trim()
    ) {
      throw new AppError(
        'Authentication, school context and a valid report identifier are required.',
        401
      );
    }

    await assertReportAccess({
      schoolId,
      userId,
      role,
      reportType,
      reportId
    });

    next();
  });
};
