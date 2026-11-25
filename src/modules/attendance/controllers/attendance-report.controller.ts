
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getStudentAttendanceReport,
  getSectionAttendanceReport,
  getSchoolAttendanceReport
} from '../services/attendance-report.service.js';

import {
  attendanceReportQuerySchema,
  sectionAttendanceReportQuerySchema
} from '../validators/attendance-report.validator.js';

export const getStudentAttendanceReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const studentId = Array.isArray(req.params.studentId)
      ? req.params.studentId[0]
      : req.params.studentId;

    if (!schoolId || !studentId) {
      throw new AppError('Student report context required.', 400);
    }

    const filters = attendanceReportQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid attendance report period.', 400);
    }

    const data = await getStudentAttendanceReport(
      schoolId,
      studentId,
      filters.data.startDate,
      filters.data.endDate
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getSectionAttendanceReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const sectionId = Array.isArray(req.params.sectionId)
      ? req.params.sectionId[0]
      : req.params.sectionId;

    if (!schoolId || !sectionId) {
      throw new AppError('Section report context required.', 400);
    }

    const filters =
      sectionAttendanceReportQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid section attendance report period.', 400);
    }

    const data = await getSectionAttendanceReport(
      schoolId,
      sectionId,
      filters.data.academicYearId,
      filters.data.startDate,
      filters.data.endDate
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getSchoolAttendanceReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const filters =
      sectionAttendanceReportQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid school attendance report period.', 400);
    }

    const data = await getSchoolAttendanceReport(
      schoolId,
      filters.data.academicYearId,
      filters.data.startDate,
      filters.data.endDate
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
