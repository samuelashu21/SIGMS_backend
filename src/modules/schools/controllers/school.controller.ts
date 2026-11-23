
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  registerSchool,
  getSchoolProfile,
  updateSchoolProfile
} from '../services/school.service.js';

import { createSchoolSchema } from '../validators/create-school.validator.js';
import { updateSchoolSchema } from '../validators/update-school.validator.js';

/**
 * Register a new school.
 */
export const registerSchoolController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = createSchoolSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        'Invalid school registration information.',
        400
      );
    }

    const school = await registerSchool(result.data);

    res.status(201).json({
      success: true,
      message: 'School registered successfully.',
      data: school
    });
  }
);

/**
 * Retrieve school profile.
 */
export const getSchoolProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;

    // Validate and narrow schoolId to string.
    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('A valid School ID is required.', 400);
    }

    const school = await getSchoolProfile(schoolId);

    res.status(200).json({
      success: true,
      message: 'School profile retrieved successfully.',
      data: school
    });
  }
);

/**
 * Update school profile.
 */
export const updateSchoolProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;

    // Validate and narrow schoolId to string.
    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('A valid School ID is required.', 400);
    }

    const result = updateSchoolSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        'Invalid school profile information.',
        400
      );
    }

    const school = await updateSchoolProfile(
      schoolId,
      result.data
    );

    res.status(200).json({
      success: true,
      message: 'School profile updated successfully.',
      data: school
    });
  }
);
