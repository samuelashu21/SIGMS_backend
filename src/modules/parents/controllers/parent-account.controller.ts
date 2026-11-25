
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { createParentAccount } from '../services/parent-account.service.js';

import {
  createParentAccountSchema
} from '../validators/parent-account.validator.js';

export const createParentAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const input = createParentAccountSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid parent account information.', 400);
    }

    const data = await createParentAccount(schoolId, input.data);

    res.status(201).json({
      success: true,
      message: 'Parent account created.',
      data
    });
  }
);
