
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  verifyStudentGuardianRelationship,
  getPendingGuardianRelationships
} from '../services/guardian-relationship-verification.service.js';

import {
  verifyGuardianRelationshipSchema
} from '../validators/guardian-relationship-verification.validator.js';

export const verifyGuardianRelationshipController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const relationshipId = req.params.relationshipId;
    const verifiedById = req.auth?.sub;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    if (
      typeof relationshipId !== 'string' ||
      !relationshipId.trim()
    ) {
      throw new AppError('Valid relationship ID is required.', 400);
    }

    if (!verifiedById) {
      throw new AppError('Verification user context required.', 401);
    }

    const input = verifyGuardianRelationshipSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid verification decision.', 400);
    }

    const data = await verifyStudentGuardianRelationship(
      schoolId,
      relationshipId,
      verifiedById,
      input.data
    );

    res.status(200).json({
      success: true,
      message: `Guardian relationship ${input.data.decision.toLowerCase()}.`,
      data
    });
  }
);

export const getPendingGuardianRelationshipsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const data = await getPendingGuardianRelationships(schoolId);

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
