
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createExaminationType,
  getExaminationTypes,
  updateExaminationType,
  deleteExaminationType
} from '../services/examination-type.service.js';

import {
  createExaminationTypeSchema,
  updateExaminationTypeSchema
} from '../validators/examination-type.validator.js';

/**
 * Safely extracts a route parameter as a string.
 * Handles Express parameter types: string | string[] | undefined.
 */
const getRouteParam = (
  value: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

/**
 * CREATE EXAMINATION TYPE
 */
export const createExaminationTypeController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const input = createExaminationTypeSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid examination type.', 400);
    }

    const data = await createExaminationType(
      schoolId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Examination type created.',
      data
    });
  }
);

/**
 * GET EXAMINATION TYPES
 */
export const getExaminationTypesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const includeInactive = req.query.includeInactive === 'true';

    const data = await getExaminationTypes(
      schoolId,
      includeInactive
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

/**
 * UPDATE EXAMINATION TYPE
 */
export const updateExaminationTypeController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const typeId = getRouteParam(req.params.typeId);

    if (!schoolId || !typeId) {
      throw new AppError(
        'Examination type context required.',
        400
      );
    }

    const input = updateExaminationTypeSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid examination type update.',
        400
      );
    }

    const data = await updateExaminationType(
      schoolId,
      typeId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Examination type updated.',
      data
    });
  }
);

/**
 * DELETE (DEACTIVATE) EXAMINATION TYPE
 */
export const deleteExaminationTypeController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const typeId = getRouteParam(req.params.typeId);

    if (!schoolId || !typeId) {
      throw new AppError(
        'Examination type context required.',
        400
      );
    }

    const data = await deleteExaminationType(
      schoolId,
      typeId
    );

    res.status(200).json({
      success: true,
      message: 'Examination type deactivated.',
      data
    });
  }
);
