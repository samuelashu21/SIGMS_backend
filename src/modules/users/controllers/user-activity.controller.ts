
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { getUserActivityHistory } from '../services/user-activity.service.js';

export const getUserActivityController = asyncHandler(
  async (req: Request, res: Response) => {
    // Validate user ID
    const userId = req.params.userId;

    if (typeof userId !== 'string' || !userId.trim()) {
      throw new AppError('A valid user ID is required.', 400);
    }

    // Validate pagination parameters
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      throw new AppError('Invalid pagination parameters.', 400);
    }

    // Retrieve activity history
    const result = await getUserActivityHistory(
      userId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      message: 'User activity history retrieved successfully.',
      data: result.activities,
      pagination: result.pagination
    });
  }
);
