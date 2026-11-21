
import type {
  Request,
  Response,
  NextFunction
} from 'express';

import { verifyAccessToken } from '../services/index.js';
import { AppError } from '../../../utils/app-error.js';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppError('Authentication required.', 401);
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new AppError('Access token is missing.', 401);
    }

    req.auth = verifyAccessToken(token);

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    return next(new AppError('Invalid or expired access token.', 401));
  }
};
