
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { requestPasswordReset } from '../services/forgot-password.service.js';
import { forgotPasswordSchema } from '../validators/forgot-password.validator.js';

export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('A valid email address is required.', 400);
    }

    await requestPasswordReset(result.data.email);

    res.status(200).json({
      success: true,
      message: 'If an eligible account exists, password reset instructions will be sent.'
    });
  }
);
