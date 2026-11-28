
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  generateExaminationReportSchema,
  examinationReportQuerySchema
} from '../validators/examination-report.validator.js';

import {
  generateExaminationReport,
  getExaminationReports
} from '../services/examination-report.service.js';

export const generateExaminationReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const generatedById = req.auth?.sub;

    if (!schoolId || !generatedById) {
      throw new AppError('Authentication and school context required.', 401);
    }

    const parsed = generateExaminationReportSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid examination report request.', 400);
    }

    const data = await generateExaminationReport(
      schoolId,
      generatedById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Examination report generated.',
      data
    });
  }
);

export const getExaminationReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const parsed = examinationReportQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError('Invalid examination report filters.', 400);
    }

    const data = await getExaminationReports(
      schoolId,
      parsed.data
    );

    res.status(200).json({ success: true, data });
  }
);
