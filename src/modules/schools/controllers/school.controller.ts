
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { registerSchool } from '../services/school.service.js';
import { createSchoolSchema } from '../validators/create-school.validator.js';

export const registerSchoolController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = createSchoolSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid school registration information.', 400);
    }

    const school = await registerSchool(result.data);

    res.status(201).json({
      success: true,
      message: 'School registered successfully.',
      data: school
    });
  }
);
