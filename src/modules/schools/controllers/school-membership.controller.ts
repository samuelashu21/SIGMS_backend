
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getSchoolMemberships,
  updateSchoolMembership
} from '../services/school-membership.service.js';

import {
  updateSchoolMembershipSchema
} from '../validators/update-school-membership.validator.js';

/**
 * Retrieve all memberships belonging to a school.
 */
export const getSchoolMembershipsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;

    // Validate and narrow schoolId to string.
    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('A valid School ID is required.', 400);
    }

    const memberships = await getSchoolMemberships(schoolId);

    res.status(200).json({
      success: true,
      message: 'School memberships retrieved successfully.',
      data: memberships
    });
  }
);

/**
 * Update a school membership.
 */
export const updateSchoolMembershipController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;
    const membershipId = req.params.membershipId;

    // Validate and narrow both route parameters.
    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('A valid School ID is required.', 400);
    }

    if (typeof membershipId !== 'string' || !membershipId.trim()) {
      throw new AppError('A valid Membership ID is required.', 400);
    }

    // Validate request body.
    const result = updateSchoolMembershipSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError('Invalid membership information.', 400);
    }

    // Update membership.
    const membership = await updateSchoolMembership(
      schoolId,
      membershipId,
      result.data
    );

    res.status(200).json({
      success: true,
      message: 'School membership updated successfully.',
      data: membership
    });
  }
);
