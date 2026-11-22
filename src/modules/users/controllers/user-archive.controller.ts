
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { archiveUser } from '../services/user-archive.service.js';

export const archiveUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (!req.auth) {
      throw new AppError('Authentication required.', 401);
    }

    if (!userId) {
      throw new AppError('User ID is required.', 400);
    }

    if (typeof userId !== 'string' || !userId.trim()) {
      throw new AppError('A valid user ID is required.', 400);
    }
 
    const user = await archiveUser(userId, req.auth.sub);

    res.status(200).json({
      success: true,
      message: 'User account archived successfully.',
      data: user
    });
  }
); 
