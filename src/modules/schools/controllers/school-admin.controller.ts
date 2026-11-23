
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { createSchoolAdministrator } from '../services/school-admin.service.js';
import { createSchoolAdminSchema } from '../validators/create-school-admin.validator.js';

/**
 * Create a school administrator.
 */
export const createSchoolAdministratorController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;

    // Validate and narrow schoolId to string.
    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('A valid School ID is required.', 400);
    }

    // Validate request body.
    const result = createSchoolAdminSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        'Invalid school administrator information.',
        400
      );
    }

    // Create school administrator.
    const administrator = await createSchoolAdministrator(
      schoolId,
      result.data
    );

    res.status(201).json({
      success: true,
      message: 'School administrator created successfully.',
      data: administrator
    });
  }
);
