
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createGrade,
  getGrades,
  getGrade,
  updateGrade
} from '../services/grade.service.js';

import {
  createGradeSchema,
  updateGradeSchema
} from '../validators/grade.validator.js';

/**
 * Get authenticated tenant school ID.
 */
const schoolIdFrom = (req: Request): string => {
  const schoolId = req.tenant?.schoolId;

  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new AppError('Tenant context required.', 403);
  }

  return schoolId;
};

/**
 * Validate and retrieve a route parameter.
 */
const getRouteParam = (
  req: Request,
  paramName: string,
  errorMessage: string
): string => {
  const value = req.params[paramName];

  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(errorMessage, 400);
  }

  return value;
};

/**
 * Create a grade.
 */
export const createGradeController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createGradeSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid grade data.', 400);
    }

    const data = await createGrade(
      schoolIdFrom(req),
      input.data
    );

    res.status(201).json({
      success: true,
      data
    });
  }
);

/**
 * Retrieve all grades for a school.
 */
export const getGradesController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getGrades(schoolIdFrom(req));

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Retrieve a specific grade.
 */
export const getGradeController = asyncHandler(
  async (req: Request, res: Response) => {
    const gradeId = getRouteParam(
      req,
      'gradeId',
      'A valid Grade ID is required.'
    );

    const data = await getGrade(
      schoolIdFrom(req),
      gradeId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Update a grade.
 */
export const updateGradeController = asyncHandler(
  async (req: Request, res: Response) => {
    const gradeId = getRouteParam(
      req,
      'gradeId',
      'A valid Grade ID is required.'
    );

    const input = updateGradeSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid grade data.', 400);
    }

    const data = await updateGrade(
      schoolIdFrom(req),
      gradeId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
