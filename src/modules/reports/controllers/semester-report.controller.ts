
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  generateSemesterReportSchema,
  semesterReportQuerySchema
} from '../validators/semester-report.validator.js';

import {
  generateSemesterReport,
  getSemesterReports
} from '../services/semester-report.service.js';

export const generateSemesterReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError('Authentication and school context required.', 401);
    }

    const parsed = generateSemesterReportSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid semester report request.', 400);
    }

    const data = await generateSemesterReport(
      schoolId,
      createdById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Semester report generated.',
      data
    });
  }
);

export const getSemesterReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const parsed = semesterReportQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError('Invalid semester report filters.', 400);
    }

    const data = await getSemesterReports(schoolId, parsed.data);

    res.status(200).json({ success: true, data });
  }
);
