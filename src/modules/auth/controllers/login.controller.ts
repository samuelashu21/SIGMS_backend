
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { loginUser } from '../services/login.service.js';
import { loginSchema } from '../validators/login.validator.js';

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid login information.', 400);
    }

    const data = await loginUser(result.data);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data
    });
  }
);
