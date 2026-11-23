
import type { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createGradingSystem,
  getGradingSystems,
  getGradingSystem,
  updateGradingSystem,
  setDefaultGradingSystem,
  replaceGradeScales
} from '../services/grading-system.service.js';

import {
  createGradingSystemSchema,
  updateGradingSystemSchema,
  replaceGradeScalesSchema
} from '../validators/grading-system.validator.js';

const getSchoolId = (req: Request): string => {
  const schoolId = req.tenant?.schoolId;

  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new AppError('Tenant context required.', 403);
  }

  return schoolId;
};

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

export const createGradingSystemController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createGradingSystemSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid grading system.', 400);
    }

    const data = await createGradingSystem(
      getSchoolId(req),
      input.data
    );

    res.status(201).json({ success: true, data });
  }
);

export const getGradingSystemsController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getGradingSystems(getSchoolId(req));

    res.status(200).json({ success: true, data });
  }
);

export const getGradingSystemController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getRouteParam(
      req,
      'gradingSystemId',
      'Grading system ID required.'
    );

    const data = await getGradingSystem(getSchoolId(req), id);

    res.status(200).json({ success: true, data });
  }
);

export const updateGradingSystemController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getRouteParam(
      req,
      'gradingSystemId',
      'Grading system ID required.'
    );

    const input = updateGradingSystemSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid grading system.', 400);
    }

    const data = await updateGradingSystem(
      getSchoolId(req),
      id,
      input.data
    );

    res.status(200).json({ success: true, data });
  }
);

export const setDefaultGradingSystemController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getRouteParam(
      req,
      'gradingSystemId',
      'Grading system ID required.'
    );

    const data = await setDefaultGradingSystem(
      getSchoolId(req),
      id
    );

    res.status(200).json({
      success: true,
      message: 'Default grading system updated.',
      data
    });
  }
);

export const replaceGradeScalesController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getRouteParam(
      req,
      'gradingSystemId',
      'Grading system ID required.'
    );

    const input = replaceGradeScalesSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid grade scales.', 400);
    }

    const data = await replaceGradeScales(
      getSchoolId(req),
      id,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Grade scales replaced successfully.',
      data
    });
  }
);
