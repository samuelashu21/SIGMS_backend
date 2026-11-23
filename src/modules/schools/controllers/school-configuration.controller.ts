
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getSchoolConfiguration,
  updateSchoolConfiguration
} from '../services/school-configuration.service.js';

import {
  updateSchoolConfigurationSchema
} from '../validators/school-configuration.validator.js';

/**
 * Retrieve school configuration.
 */
export const getSchoolConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;

    // Validate and narrow schoolId to string.
    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('A valid School ID is required.', 400);
    }

    const configuration = await getSchoolConfiguration(schoolId);

    res.status(200).json({
      success: true,
      message: 'School configuration retrieved successfully.',
      data: configuration
    });
  }
);

/**
 * Update school configuration.
 */
export const updateSchoolConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;

    // Validate and narrow schoolId to string.
    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('A valid School ID is required.', 400);
    }

    const result = updateSchoolConfigurationSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid school configuration.', 400);
    }

    const configuration = await updateSchoolConfiguration(
      schoolId,
      result.data
    );

    res.status(200).json({
      success: true,
      message: 'School configuration updated successfully.',
      data: configuration
    });
  }
);
