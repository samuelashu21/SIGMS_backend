
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createPromotionConfigurationSchema,
  updatePromotionConfigurationSchema
} from '../validators/promotion-configuration.validator.js';

import {
  createPromotionConfiguration,
  getPromotionConfigurations,
  updatePromotionConfiguration,
  deactivatePromotionConfiguration
} from '../services/promotion-configuration.service.js';

/**
 * Normalize and validate an Express route parameter.
 * Express 5 may type route parameters as string | string[].
 */
const getRouteParam = (
  value: string | string[] | undefined
): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
};

/**
 * Create promotion configuration
 */
export const createPromotionConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError('School context required.', 400);
    }

    const parsed = createPromotionConfigurationSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid promotion configuration.', 400);
    }

    const data = await createPromotionConfiguration(
      schoolId,
      createdById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Promotion configuration created.',
      data
    });
  }
);

/**
 * Get promotion configurations
 */
export const getPromotionConfigurationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const academicYearId =
      typeof req.query.academicYearId === 'string'
        ? req.query.academicYearId
        : undefined;

    const data = await getPromotionConfigurations(
      schoolId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Update promotion configuration
 */
export const updatePromotionConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const updatedById = req.auth?.sub;

    const configurationId = getRouteParam(
      req.params.configurationId
    );

    if (!schoolId || !updatedById || !configurationId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const parsed = updatePromotionConfigurationSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid promotion configuration.', 400);
    }

    const data = await updatePromotionConfiguration(
      schoolId,
      configurationId,
      updatedById,
      parsed.data
    );

    res.status(200).json({
      success: true,
      message: 'Promotion configuration updated.',
      data
    });
  }
);

/**
 * Deactivate promotion configuration
 */
export const deactivatePromotionConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const updatedById = req.auth?.sub;

    const configurationId = getRouteParam(
      req.params.configurationId
    );

    if (!schoolId || !updatedById || !configurationId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const data = await deactivatePromotionConfiguration(
      schoolId,
      configurationId,
      updatedById
    );

    res.status(200).json({
      success: true,
      message: 'Promotion configuration deactivated.',
      data
    });
  }
);
