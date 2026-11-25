
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createGuardianProfile,
  getGuardianProfiles,
  getGuardianProfile,
  updateGuardianProfile
} from '../services/guardian-profile.service.js';

import {
  createGuardianProfileSchema,
  updateGuardianProfileSchema
} from '../validators/guardian-profile.validator.js';

export const createGuardianProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const input = createGuardianProfileSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid guardian profile information.', 400);
    }

    const data = await createGuardianProfile(schoolId, input.data);

    res.status(201).json({
      success: true,
      message: 'Guardian profile created.',
      data
    });
  }
);

export const getGuardianProfilesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : undefined;

    const data = await getGuardianProfiles(schoolId, search);

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const getGuardianProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const guardianId = Array.isArray(req.params.guardianId)
      ? req.params.guardianId[0]
      : req.params.guardianId;

    if (!schoolId || !guardianId) {
      throw new AppError('Guardian context required.', 400);
    }

    const data = await getGuardianProfile(schoolId, guardianId);

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const updateGuardianProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const guardianId = Array.isArray(req.params.guardianId)
      ? req.params.guardianId[0]
      : req.params.guardianId;

    if (!schoolId || !guardianId) {
      throw new AppError('Guardian context required.', 400);
    }

    const input = updateGuardianProfileSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid guardian profile information.', 400);
    }

    const data = await updateGuardianProfile(
      schoolId,
      guardianId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Guardian profile updated.',
      data
    });
  }
);
