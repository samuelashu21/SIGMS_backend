
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  calculateSubjectGradeSchema,
  getSubjectGradeQuerySchema
} from '../validators/subject-grade.validator.js';

import {
  calculateSubjectGrade,
  getSubjectGradeResults
} from '../services/subject-grade.service.js';

export const calculateSubjectGradeController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = calculateSubjectGradeSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid subject grade calculation request.', 400);
    }

    const data = await calculateSubjectGrade(schoolId, input.data);

    res.status(200).json({
      success: true,
      message: 'Subject grade calculated successfully.',
      data
    });
  }
);

export const getSubjectGradeResultsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const query = getSubjectGradeQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError('Invalid subject grade filters.', 400);
    }

    const data = await getSubjectGradeResults(
      schoolId,
      query.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
