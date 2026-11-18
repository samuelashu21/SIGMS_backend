
import type {
  Request,
  Response,
  NextFunction
} from 'express';

import { AppError } from '../utils/app-error.js';
import { env } from '../config/env.js';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode =
    error instanceof AppError ? error.statusCode : 500;

  const message =
    error instanceof AppError
      ? error.message
      : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  });
};
