
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { changeUserPassword } from '../services/change-password.service.js';
import { changePasswordSchema } from '../validators/password.validator.js';

export const changePasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new AppError('Authentication required.', 401);
    }

    const result = changePasswordSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid password information.', 400);
    }

    const data = await changeUserPassword({
      userId: req.auth.sub,
      currentSessionId: req.auth.sessionId,
      ...result.data
    });

    res.status(200).json({
      success: true,
      message: data.message
    });
  }
);
