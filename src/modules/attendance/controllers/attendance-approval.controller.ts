
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  submitClassAttendance,
  reviewClassAttendance,
  getPendingClassAttendance
} from '../services/attendance-approval.service.js';

import {
  reviewClassAttendanceSchema
} from '../validators/attendance-approval.validator.js';

export const submitClassAttendanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const submittedById = req.auth?.sub;

    const attendanceId = Array.isArray(req.params.attendanceId)
      ? req.params.attendanceId[0]
      : req.params.attendanceId;

    if (!schoolId || !submittedById || !attendanceId) {
      throw new AppError(
        'Attendance submission context required.',
        400
      );
    }

    const data = await submitClassAttendance(
      schoolId,
      attendanceId,
      submittedById
    );

    res.status(200).json({
      success: true,
      message: 'Attendance submitted for approval.',
      data
    });
  }
);

export const reviewClassAttendanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const approvedById = req.auth?.sub;

    const attendanceId = Array.isArray(req.params.attendanceId)
      ? req.params.attendanceId[0]
      : req.params.attendanceId;

    if (!schoolId || !approvedById || !attendanceId) {
      throw new AppError(
        'Attendance approval context required.',
        400
      );
    }

    const input = reviewClassAttendanceSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid attendance approval decision.',
        400
      );
    }

    const data = await reviewClassAttendance(
      schoolId,
      attendanceId,
      approvedById,
      input.data
    );

    res.status(200).json({
      success: true,
      message: `Attendance ${input.data.decision.toLowerCase()}.`,
      data
    });
  }
);

export const getPendingClassAttendanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const data = await getPendingClassAttendance(schoolId);

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
