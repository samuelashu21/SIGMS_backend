
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { updateUserStatus } from '../services/user.service.js';
import { userStatusSchema } from '../validators/user-status.validator.js';

export const updateUserStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (typeof userId !== 'string' || !userId.trim()) {
      throw new AppError('A valid user ID is required.', 400);
    }

    const result = userStatusSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid account status.', 400);
    }

    const user = await updateUserStatus(
      userId,
      result.data.isActive
    );

    res.status(200).json({
      success: true,
      message: result.data.isActive
        ? 'User account activated successfully.'
        : 'User account deactivated successfully.',
      data: user
    });
  }
);
