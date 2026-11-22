
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { revokeAuthSession } from '../services/session.service.js';
import { AUTH_COOKIE_OPTIONS } from '../auth.cookies.js';

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new AppError('Authentication required.', 401);
    }

    await revokeAuthSession(
      req.auth.sessionId,
      req.auth.sub
    );

    res.clearCookie('refreshToken', AUTH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Logout successful.'
    });
  }
);
