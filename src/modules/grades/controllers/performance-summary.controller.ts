
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  generatePerformanceSummarySchema,
  performanceSummaryQuerySchema
} from '../validators/performance-summary.validator.js';

import {
  generateAcademicPerformanceSummary,
  getAcademicPerformanceSummaries,
  getStudentAcademicPerformanceOverview
} from '../services/performance-summary.service.js';

export const generateAcademicPerformanceSummaryController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = generatePerformanceSummarySchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid performance summary request.', 400);
    }

    const data = await generateAcademicPerformanceSummary(
      schoolId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Academic performance summary generated.',
      data
    });
  });

export const getAcademicPerformanceSummariesController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const query = performanceSummaryQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError('Invalid performance summary filters.', 400);
    }

    const data = await getAcademicPerformanceSummaries(
      schoolId,
      query.data
    );

    res.status(200).json({
      success: true,
      data
    });
  });

export const getStudentAcademicPerformanceOverviewController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;
    const academicYearId = req.query.academicYearId;

    if (
      !schoolId ||
      typeof studentId !== 'string' ||
      typeof academicYearId !== 'string'
    ) {
      throw new AppError(
        'Student and academic year are required.',
        400
      );
    }

    const data = await getStudentAcademicPerformanceOverview(
      schoolId,
      studentId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  });
