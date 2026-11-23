
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { createParentAccount } from '../services/parent-account.service.js';
import { createParentAccountSchema } from '../validators/create-parent-account.validator.js';

export const createParentAccountController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = createParentAccountSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid parent account information.', 400);
    }

    const parent = await createParentAccount(result.data);

    res.status(201).json({
      success: true,
      message: 'Parent account created successfully.',
      data: parent
    });
  }
);
