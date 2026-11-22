
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';
import { restoreUser } from '../services/user-restore.service.js';

export const restoreUserController = asyncHandler(
  async (req: Request, res: Response) => {
    // 1. Verify authentication
    if (!req.auth) {
      throw new AppError('Authentication required.', 401);
    }

    // 2. Validate user ID
    const userId = req.params.userId;

    if (typeof userId !== 'string' || !userId.trim()) {
      throw new AppError('A valid user ID is required.', 400);
    }

    // 3. Restore user account
    const user = await restoreUser(
      userId,
      req.auth.sub
    );

    // 4. Return response
    res.status(200).json({
      success: true,
      message: 'User account restored successfully.',
      data: user
    });
  }
);
