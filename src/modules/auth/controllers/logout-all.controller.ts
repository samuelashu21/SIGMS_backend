
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';
import { revokeAllUserSessions } from '../services/logout-all.service.js';
import { AUTH_COOKIE_OPTIONS } from '../auth.cookies.js';

export const logoutAllController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new AppError('Authentication required.', 401);
    }

    const result = await revokeAllUserSessions(req.auth.sub);

    res.clearCookie('refreshToken', AUTH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'All sessions have been revoked.',
      data: {
        revokedSessions: result.count
      }
    });
  }
);
