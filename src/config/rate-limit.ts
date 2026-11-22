
import rateLimit from 'express-rate-limit';

const createRateLimiter = (
  windowMs: number,
  limit: number,
  message: string
) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      status: 'fail',
      message
    }
  });

export const globalRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  300,
  'Too many API requests. Please try again later.'
);

export const authenticationRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts. Please try again later.'
);

export const passwordRecoveryRateLimiter = createRateLimiter(
  60 * 60 * 1000,
  5,
  'Too many password recovery requests. Please try again later.'
);

export const sensitiveOperationRateLimiter = createRateLimiter(
  60 * 1000,
  20,
  'Too many sensitive operations. Please try again later.'
);
