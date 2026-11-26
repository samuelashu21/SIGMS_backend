
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  rankingConfigurationSchema,
  calculateRankingSchema,
  rankingQuerySchema
} from '../validators/academic-ranking.validator.js';

import {
  configureAcademicRanking,
  calculateAcademicRankings,
  getAcademicRankings,
  getStudentAcademicRanking
} from '../services/academic-ranking.service.js';

// ============================================
// CONFIGURE ACADEMIC RANKING
// ============================================

export const configureAcademicRankingController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = rankingConfigurationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid ranking configuration.', 400);
    }

    const data = await configureAcademicRanking(
      schoolId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Ranking configuration saved.',
      data
    });
  }
);

// ============================================
// CALCULATE ACADEMIC RANKINGS
// ============================================

export const calculateAcademicRankingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = calculateRankingSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid ranking calculation request.',
        400
      );
    }

    const data = await calculateAcademicRankings(
      schoolId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Academic rankings calculated.',
      data
    });
  }
);

// ============================================
// GET ACADEMIC RANKINGS
// ============================================

export const getAcademicRankingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const query = rankingQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError('Invalid ranking filters.', 400);
    }

    const data = await getAcademicRankings(
      schoolId,
      query.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// GET STUDENT ACADEMIC RANKING
// ============================================

export const getStudentAcademicRankingController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;

    if (
      !schoolId ||
      typeof studentId !== 'string'
    ) {
      throw new AppError(
        'School and student context required.',
        400
      );
    }

    const query = rankingQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError('Invalid ranking filters.', 400);
    }

    const viewer =
      req.auth?.role === 'PARENT' ? 'PARENT' : 'STUDENT';

    const data = await getStudentAcademicRanking(
      schoolId,
      studentId,
      {
        academicYearId: query.data.academicYearId,
        gradeId: query.data.gradeId,
        period: query.data.period,
        semesterId: query.data.semesterId,
        viewer
      }
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
