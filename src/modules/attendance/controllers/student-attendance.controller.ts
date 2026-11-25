
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getStudentAttendanceRecords,
  getStudentAttendanceRecordById,
  updateStudentAttendanceRecord
} from '../services/student-attendance.service.js';

import {
  studentAttendanceQuerySchema,
  updateStudentAttendanceSchema
} from '../validators/student-attendance.validator.js';

export const getStudentAttendanceRecordsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const filters = studentAttendanceQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid student attendance filters.', 400);
    }

    const data = await getStudentAttendanceRecords(
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

export const getStudentAttendanceRecordByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const studentId = Array.isArray(req.params.studentId)
      ? req.params.studentId[0]
      : req.params.studentId;

    const recordId = Array.isArray(req.params.recordId)
      ? req.params.recordId[0]
      : req.params.recordId;

    if (!schoolId || !studentId || !recordId) {
      throw new AppError('Attendance record context required.', 400);
    }

    const data = await getStudentAttendanceRecordById(
      schoolId,
      studentId,
      recordId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const updateStudentAttendanceRecordController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const recordId = Array.isArray(req.params.recordId)
      ? req.params.recordId[0]
      : req.params.recordId;

    if (!schoolId || !recordId) {
      throw new AppError('Attendance record context required.', 400);
    }

    const input = updateStudentAttendanceSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid student attendance information.', 400);
    }

    const data = await updateStudentAttendanceRecord(
      schoolId,
      recordId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Student attendance record updated.',
      data
    });
  }
);
