
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAcademicGradingConfigurationSchema,
  updateAcademicGradingConfigurationSchema
} from '../validators/academic-grading.validator.js';

import {
  createAcademicGradingConfiguration,
  getAcademicGradingConfigurations,
  getAcademicGradingConfiguration,
  updateAcademicGradingConfiguration
} from '../services/academic-grading.service.js';

// Helper: safely extract a string route parameter
const getStringParam = (
  value: string | string[] | undefined
): string | undefined => {
  return typeof value === 'string' ? value : undefined;
};

// Create academic grading configuration
export const createAcademicGradingConfigurationController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input =
      createAcademicGradingConfigurationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid grading configuration.', 400);
    }

    const data = await createAcademicGradingConfiguration(
      schoolId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Academic grading configuration created.',
      data
    });
  });

// Get all academic grading configurations
export const getAcademicGradingConfigurationsController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const academicYearId =
      typeof req.query.academicYearId === 'string'
        ? req.query.academicYearId
        : undefined;

    const data = await getAcademicGradingConfigurations(
      schoolId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  });

// Get academic grading configuration by ID
export const getAcademicGradingConfigurationController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const configurationId = getStringParam(
      req.params.configurationId
    );

    if (!schoolId || !configurationId) {
      throw new AppError('Configuration context required.', 400);
    }

    const data = await getAcademicGradingConfiguration(
      schoolId,
      configurationId
    );

    res.status(200).json({
      success: true,
      data
    });
  });

// Update academic grading configuration
export const updateAcademicGradingConfigurationController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const configurationId = getStringParam(
      req.params.configurationId
    );

    if (!schoolId || !configurationId) {
      throw new AppError('Configuration context required.', 400);
    }

    const input =
      updateAcademicGradingConfigurationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid grading configuration update.',
        400
      );
    }

    const data = await updateAcademicGradingConfiguration(
      schoolId,
      configurationId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Academic grading configuration updated.',
      data
    });
  });
