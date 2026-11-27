
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  generateAttendanceReportSchema,
  attendanceReportQuerySchema
} from '../validators/attendance-report.validator.js';

import {
  generateAttendanceReport,
  getAttendanceReports
} from '../services/attendance-report.service.js';

export const generateAttendanceReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const generatedById = req.auth?.sub;

    if (!schoolId || !generatedById) {
      throw new AppError('Authentication and school context required.', 401);
    }

    const parsed = generateAttendanceReportSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid attendance report request.', 400);
    }

    const data = await generateAttendanceReport(
      schoolId,
      generatedById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Attendance report generated.',
      data
    });
  }
);

export const getAttendanceReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const parsed = attendanceReportQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError('Invalid attendance report filters.', 400);
    }

    const data = await getAttendanceReports(
      schoolId,
      parsed.data
    );

    res.status(200).json({ success: true, data });
  }
);
