
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createUserMembership,
  getUserMemberships
} from '../services/user-membership.service.js';

import {
  createMembershipSchema
} from '../validators/user-membership.validator.js';

/**
 * Create a user-school membership.
 */
export const createMembershipController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    // Validate and narrow userId to string.
    if (typeof userId !== 'string' || !userId.trim()) {
      throw new AppError('A valid User ID is required.', 400);
    }

    // Validate request body.
    const result = createMembershipSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid membership information.', 400);
    }

    // Create membership.
    const membership = await createUserMembership(
      userId,
      result.data
    );

    res.status(201).json({
      success: true,
      message: 'User-school membership created successfully.',
      data: membership
    });
  }
);

/**
 * Retrieve all school memberships associated with a user.
 */
export const getUserMembershipsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;

    // Validate and narrow userId to string.
    if (typeof userId !== 'string' || !userId.trim()) {
      throw new AppError('A valid User ID is required.', 400);
    }

    // Retrieve user memberships.
    const memberships = await getUserMemberships(userId);

    res.status(200).json({
      success: true,
      message: 'User memberships retrieved successfully.',
      data: memberships
    });
  }
);
