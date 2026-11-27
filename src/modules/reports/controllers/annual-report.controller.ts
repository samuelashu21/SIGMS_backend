
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  generateAnnualReportSchema,
  annualReportQuerySchema
} from '../validators/annual-report.validator.js';

import {
  generateAnnualReport,
  getAnnualReports
} from '../services/annual-report.service.js';

export const generateAnnualReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError('Authentication and school context required.', 401);
    }

    const parsed = generateAnnualReportSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid annual report request.', 400);
    }

    const data = await generateAnnualReport(
      schoolId,
      createdById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Annual report generated.',
      data
    });
  }
);

export const getAnnualReportsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const parsed = annualReportQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError('Invalid annual report filters.', 400);
    }

    const data = await getAnnualReports(schoolId, parsed.data);

    res.status(200).json({ success: true, data });
  }
);
