
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getSchoolSettings,
  updateSchoolSettings
} from '../services/school-settings.service.js';

import {
  updateSchoolSettingsSchema
} from '../validators/school-settings.validator.js';

export const getSchoolSettingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;

    if (!schoolId) {
      throw new AppError('School ID is required.', 400);
    }

    const settings = await getSchoolSettings(schoolId);

    res.status(200).json({
      success: true,
      message: 'School settings retrieved successfully.',
      data: settings
    });
  }
);

export const updateSchoolSettingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;

    if (!schoolId) {
      throw new AppError('School ID is required.', 400);
    }

    const result = updateSchoolSettingsSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid school settings.', 400);
    }

    const settings = await updateSchoolSettings(
      schoolId,
      result.data
    );

    res.status(200).json({
      success: true,
      message: 'School settings updated successfully.',
      data: settings
    });
  }
);
