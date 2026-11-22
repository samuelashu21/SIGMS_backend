
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';
import { refreshAuthSession } from '../services/refresh-session.service.js';

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken;

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new AppError('Refresh token is required.', 401);
    }

    const tokens = await refreshAuthSession(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Session refreshed successfully.',
      data: tokens
    });
  }
);
