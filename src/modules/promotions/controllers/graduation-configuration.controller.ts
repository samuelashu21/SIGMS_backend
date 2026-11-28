
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createGraduationConfigurationSchema
} from '../validators/graduation-configuration.validator.js';

import {
  createGraduationConfiguration,
  getGraduationConfigurations
} from '../services/graduation-configuration.service.js';

export const createGraduationConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError('School context required.', 400);
    }

    const parsed = createGraduationConfigurationSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid graduation configuration.', 400);
    }

    const data = await createGraduationConfiguration(
      schoolId,
      createdById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Graduation configuration created.',
      data
    });
  }
);

export const getGraduationConfigurationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const academicYearId =
      typeof req.query.academicYearId === 'string'
        ? req.query.academicYearId
        : undefined;

    const data = await getGraduationConfigurations(
      schoolId,
      academicYearId
    );

    res.status(200).json({ success: true, data });
  }
);
