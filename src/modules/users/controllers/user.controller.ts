
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createUser,
  getUserById,
  getUsers
} from '../services/user.service.js';

import { createUserSchema } from '../validators/create-user.validator.js';
import { userQuerySchema } from '../validators/user-query.validator.js';
import { updateUserProfile } from '../services/user.service.js';
import { updateUserSchema } from '../validators/update-user.validator.js';


export const createUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = createUserSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid user information.', 400);
    }

    const user = await createUser(result.data);

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user
    });
  }
);

export const getUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (typeof userId !== 'string' || !userId.trim()) {
      throw new AppError('A valid user ID is required.', 400);
    }

    const user = await getUserById(userId);

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully.',
      data: user
    });
  }
);

export const getUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = userQuerySchema.safeParse(req.query);

    if (!result.success) {
      throw new AppError('Invalid user query parameters.', 400);
    }

    const data = await getUsers(result.data);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: data.users,
      pagination: data.pagination
    });
  }
);




export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    if (typeof userId !== 'string' || !userId.trim()) {
      throw new AppError('User ID is required.', 400);
    }

    const result = updateUserSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid user profile information.', 400);
    }

    const user = await updateUserProfile(userId, result.data);

    res.status(200).json({ 
      success: true,
      message: 'User profile updated successfully.',
      data: user
    });
  }
);
