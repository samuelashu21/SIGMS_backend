
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getEnrollmentHistory
} from '../services/enrollment-history.service.js';

export const getEnrollmentHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const enrollmentId = Array.isArray(req.params.enrollmentId)
      ? req.params.enrollmentId[0]
      : req.params.enrollmentId;

    if (!schoolId || !enrollmentId) {
      throw new AppError('Enrollment context is required.', 400);
    }

    const data = await getEnrollmentHistory(
      schoolId,
      enrollmentId
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
