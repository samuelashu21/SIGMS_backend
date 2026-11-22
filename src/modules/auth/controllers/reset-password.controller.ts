
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { resetUserPassword } from '../services/reset-password.service.js';
import { resetPasswordSchema } from '../validators/reset-password.validator.js';

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid password reset information.', 400);
    }

    await resetUserPassword(
      result.data.token,
      result.data.newPassword
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in again.'
    });
  }
);
