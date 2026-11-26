
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { performanceHistoryQuerySchema } from '../validators/performance-history.validator.js';

import {
  getAcademicPerformanceHistory,
  getStudentPerformanceHistory
} from '../services/performance-history.service.js';

// ============================================
// GET ACADEMIC PERFORMANCE HISTORY
// ============================================

export const getAcademicPerformanceHistoryController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const query = performanceHistoryQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError(
        'Invalid performance history filters.',
        400
      );
    }

    const data = await getAcademicPerformanceHistory(
      schoolId,
      query.data
    );

    res.status(200).json({
      success: true,
      data
    });
  });

// ============================================
// GET STUDENT PERFORMANCE HISTORY
// ============================================

export const getStudentPerformanceHistoryController =
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

    const data = await getStudentPerformanceHistory(
      schoolId,
      studentId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  });
