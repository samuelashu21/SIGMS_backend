
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { createTeacherAccount } from '../services/teacher-account.service.js';
import { createTeacherAccountSchema } from '../validators/create-teacher-account.validator.js';

export const createTeacherAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = createTeacherAccountSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid teacher account information.', 400);
    }

    const teacher = await createTeacherAccount(result.data);

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully.',
      data: teacher
    });
  }
);
