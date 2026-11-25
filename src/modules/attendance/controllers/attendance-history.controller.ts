
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getStudentAttendanceHistory,
  getClassAttendanceHistory,
  getAttendanceCorrectionHistory
} from '../services/attendance-history.service.js';

import {
  attendanceHistoryQuerySchema
} from '../validators/attendance-history.validator.js';

export const getStudentAttendanceHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const studentId = Array.isArray(req.params.studentId)
      ? req.params.studentId[0]
      : req.params.studentId;

    if (!schoolId || !studentId) {
      throw new AppError('Student history context required.', 400);
    }

    const filters = attendanceHistoryQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid attendance history filters.', 400);
    }

    const data = await getStudentAttendanceHistory(
      schoolId,
      studentId,
      filters.data
    );

    res.status(200).json({ success: true, data });
  }
);

export const getClassAttendanceHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const sectionId = Array.isArray(req.params.sectionId)
      ? req.params.sectionId[0]
      : req.params.sectionId;

    if (!schoolId || !sectionId) {
      throw new AppError('Class history context required.', 400);
    }

    const filters = attendanceHistoryQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid attendance history filters.', 400);
    }

    const data = await getClassAttendanceHistory(
      schoolId,
      sectionId,
      filters.data
    );

    res.status(200).json({ success: true, data });
  }
);

export const getAttendanceCorrectionHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const attendanceRecordId = Array.isArray(
      req.params.attendanceRecordId
    )
      ? req.params.attendanceRecordId[0]
      : req.params.attendanceRecordId;

    if (!schoolId || !attendanceRecordId) {
      throw new AppError('Correction history context required.', 400);
    }

    const data = await getAttendanceCorrectionHistory(
      schoolId,
      attendanceRecordId
    );

    res.status(200).json({ success: true, data });
  }
);
