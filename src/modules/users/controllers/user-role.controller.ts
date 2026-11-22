
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  assignUserRole,
  getRoleCatalogue
} from '../services/user-role.service.js';

import { updateUserRoleSchema } from '../validators/user-role.validator.js';

export const getRolesController = asyncHandler(
  async (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Roles retrieved successfully.',
      data: getRoleCatalogue()
    });
  }
);

export const updateUserRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (typeof userId !== 'string' || !userId.trim()) {
      throw new AppError('A valid user ID is required.', 400);
    }

    const result = updateUserRoleSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid role information.', 400);
    }

    const user = await assignUserRole(
      userId,
      result.data.role
    );

    res.status(200).json({
      success: true,
      message: 'User role updated successfully.',
      data: user
    });
  }
);
