
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getGuardianPermissions,
  updateGuardianPermissions
} from '../services/guardian-permission.service.js';

import {
  updateGuardianPermissionSchema
} from '../validators/guardian-permission.validator.js';

export const getGuardianPermissionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const relationshipId = req.params.relationshipId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    if (
      typeof relationshipId !== 'string' ||
      !relationshipId.trim()
    ) {
      throw new AppError('A valid relationship ID is required.', 400);
    }

    const data = await getGuardianPermissions(
      schoolId,
      relationshipId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const updateGuardianPermissionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const relationshipId = req.params.relationshipId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    if (
      typeof relationshipId !== 'string' ||
      !relationshipId.trim()
    ) {
      throw new AppError('A valid relationship ID is required.', 400);
    }

    const input = updateGuardianPermissionSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid guardian permission settings.', 400);
    }

    const data = await updateGuardianPermissions(
      schoolId,
      relationshipId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Guardian permissions updated.',
      data
    });
  }
);
