
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getClassAttendanceById,
  getClassAttendanceList,
  updateClassAttendance
} from '../services/class-attendance.service.js';

import {
  updateClassAttendanceSchema,
  classAttendanceQuerySchema
} from '../validators/class-attendance.validator.js';

export const getClassAttendanceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const attendanceId = Array.isArray(req.params.attendanceId)
      ? req.params.attendanceId[0]
      : req.params.attendanceId;

    if (!schoolId || !attendanceId) {
      throw new AppError('Attendance context required.', 400);
    }

    const data = await getClassAttendanceById(
      schoolId,
      attendanceId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getClassAttendanceListController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const filters = classAttendanceQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid attendance filters.', 400);
    }

    const data = await getClassAttendanceList(
      schoolId,
      filters.data
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const updateClassAttendanceController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const attendanceId = Array.isArray(req.params.attendanceId)
      ? req.params.attendanceId[0]
      : req.params.attendanceId;

    if (!schoolId || !attendanceId) {
      throw new AppError('Attendance context required.', 400);
    }

    const input = updateClassAttendanceSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid attendance information.', 400);
    }

    const data = await updateClassAttendance(
      schoolId,
      attendanceId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Class attendance updated.',
      data
    });
  }
);
