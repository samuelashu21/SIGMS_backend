
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  updateEnrollmentStatus
} from '../services/enrollment-status.service.js';

import {
  updateEnrollmentStatusSchema
} from '../validators/enrollment-status.validator.js';

export const updateEnrollmentStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const enrollmentId = Array.isArray(req.params.enrollmentId)
      ? req.params.enrollmentId[0]
      : req.params.enrollmentId;

    if (!schoolId || !enrollmentId) {
      throw new AppError('Required enrollment context is missing.', 400);
    }

    const input = updateEnrollmentStatusSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid enrollment status information.', 400);
    }

    const data = await updateEnrollmentStatus(
      schoolId,
      enrollmentId,
      input.data.status,
      input.data.reason
    );

    res.status(200).json({
      success: true,
      message: 'Enrollment status updated successfully.',
      data
    });
  }
);
