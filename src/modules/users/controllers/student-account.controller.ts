
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { createStudentAccount } from '../services/student-account.service.js';
import { createStudentAccountSchema } from '../validators/create-student-account.validator.js';

export const createStudentAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = createStudentAccountSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid student account information.', 400);
    }

    const student = await createStudentAccount(result.data);

    res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
      data: student
    });
  }
);
