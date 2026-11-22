
import type {
  Request,
  Response,
  NextFunction
} from 'express';

import { AppError } from '../utils/app-error.js';
import { environmentConfig } from '../config/environment.config.js';

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
    ...(environmentConfig.exposeErrorDetails && {
      stack: error.stack
    })
  });
};
