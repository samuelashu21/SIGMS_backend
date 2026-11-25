
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createDailyAttendance,
  getDailyAttendance
} from '../services/daily-attendance.service.js';

import {
  createDailyAttendanceSchema
} from '../validators/daily-attendance.validator.js';

export const createDailyAttendanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const recordedById = req.auth?.sub;

    if (!schoolId || !recordedById) {
      throw new AppError('Attendance context required.', 401);
    }

    const input = createDailyAttendanceSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid attendance information.', 400);
    }

    const data = await createDailyAttendance(
      schoolId,
      recordedById,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Daily attendance created.',
      data
    });
  }
);

export const getDailyAttendanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const sectionId = Array.isArray(req.params.sectionId)
      ? req.params.sectionId[0]
      : req.params.sectionId;

    const attendanceDate = req.query.date;

    if (
      !schoolId ||
      !sectionId ||
      typeof attendanceDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)
    ) {
      throw new AppError(
        'Valid section and attendance date required.',
        400
      );
    }

    const data = await getDailyAttendance(
      schoolId,
      sectionId,
      attendanceDate
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
