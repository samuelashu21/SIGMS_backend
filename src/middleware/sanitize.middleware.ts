
import type {
  Request,
  Response,
  NextFunction
} from 'express';

import { sanitizeInput } from '../utils/sanitize-input.js';

export const sanitizeRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }

  next();
};
