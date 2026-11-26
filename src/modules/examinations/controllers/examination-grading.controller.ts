
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createExaminationGradingConfiguration,
  getExaminationGradingConfiguration,
  updateExaminationGradingConfiguration
} from '../services/examination-grading.service.js';

import {
  createExaminationGradingSchema,
  updateExaminationGradingSchema
} from '../validators/examination-grading.validator.js';

/**
 * Extract and validate examination ID from route parameters.
 * Handles Express string | string[] parameter types.
 */
const getExaminationId = (req: Request): string => {
  const examinationId = req.params.examinationId;

  if (typeof examinationId !== 'string' || !examinationId.trim()) {
    throw new AppError('Valid examination ID required.', 400);
  }

  return examinationId.trim();
};

/**
 * Create examination grading configuration
 */
export const createExaminationGradingController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = getExaminationId(req);

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = createExaminationGradingSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid grading configuration.', 400);
    }

    const data = await createExaminationGradingConfiguration(
      schoolId,
      examinationId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Examination grading configuration created.',
      data
    });
  }
);

/**
 * Get examination grading configuration
 */
export const getExaminationGradingController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = getExaminationId(req);

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const data = await getExaminationGradingConfiguration(
      schoolId,
      examinationId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Update examination grading configuration
 */
export const updateExaminationGradingController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = getExaminationId(req);

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = updateExaminationGradingSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid grading configuration update.', 400);
    }

    const data = await updateExaminationGradingConfiguration(
      schoolId,
      examinationId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Grading configuration updated.',
      data
    });
  }
);
