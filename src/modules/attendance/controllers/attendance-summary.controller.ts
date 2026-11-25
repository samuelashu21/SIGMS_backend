
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getStudentAttendanceSummary,
  getClassAttendanceSummary,
  getSchoolAttendanceSummary
} from '../services/attendance-summary.service.js';

import {
  attendanceSummaryQuerySchema,
  classAttendanceSummaryQuerySchema
} from '../validators/attendance-summary.validator.js';

export const getStudentAttendanceSummaryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const studentId = Array.isArray(req.params.studentId)
      ? req.params.studentId[0]
      : req.params.studentId;

    if (!schoolId || !studentId) {
      throw new AppError('Student attendance context required.', 400);
    }

    const filters = attendanceSummaryQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid attendance summary filters.', 400);
    }

    const data = await getStudentAttendanceSummary(
      schoolId,
      studentId,
      filters.data.academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getClassAttendanceSummaryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const sectionId = Array.isArray(req.params.sectionId)
      ? req.params.sectionId[0]
      : req.params.sectionId;

    if (!schoolId || !sectionId) {
      throw new AppError('Class attendance context required.', 400);
    }

    const filters = classAttendanceSummaryQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid class attendance filters.', 400);
    }

    const data = await getClassAttendanceSummary(
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

export const getSchoolAttendanceSummaryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const filters = classAttendanceSummaryQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid school attendance filters.', 400);
    }

    const data = await getSchoolAttendanceSummary(
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
