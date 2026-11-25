 
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createStaffProfile,
  getStaffProfiles,
  getStaffProfile,
  updateStaffProfile
} from '../services/staff-profile.service.js';

import {
  createStaffProfileSchema,
  updateStaffProfileSchema
} from '../validators/staff-profile.validator.js';

export const createStaffProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('Tenant context required.', 403);
    }

    const input = createStaffProfileSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid staff information.', 400);
    }

    const data = await createStaffProfile(schoolId, input.data);

    res.status(201).json({
      success: true,
      message: 'Staff profile created.',
      data
    });
  }
);

export const getStaffProfilesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('Tenant context required.', 403);
    }

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : undefined;

    const category =
      typeof req.query.category === 'string'
        ? req.query.category
        : undefined;

    const allowedCategories = [
      'ADMINISTRATIVE',
      'REGISTRAR',
      'MANAGEMENT',
      'SUPPORT',
      'OTHER'
    ];

    if (category && !allowedCategories.includes(category)) {
      throw new AppError('Invalid staff category.', 400);
    }

    const data = await getStaffProfiles(
      schoolId,
      search,
      category as
        | 'ADMINISTRATIVE'
        | 'REGISTRAR'
        | 'MANAGEMENT'
        | 'SUPPORT'
        | 'OTHER'
        | undefined
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const getStaffProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const staffId = req.params.staffId;

    if (!schoolId || !staffId) {
      throw new AppError('Staff context required.', 400);
    }

    const data = await getStaffProfile(schoolId, staffId);

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const updateStaffProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const staffId = req.params.staffId;

    if (!schoolId || !staffId) {
      throw new AppError('Staff context required.', 400);
    }

    const input = updateStaffProfileSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid staff information.', 400);
    }

    const data = await updateStaffProfile(
      schoolId,
      staffId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Staff profile updated.',
      data
    });
  }
);
