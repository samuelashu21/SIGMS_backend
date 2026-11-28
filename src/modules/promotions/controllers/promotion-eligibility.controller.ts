
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { assessStudentPromotionEligibility } from '../services/promotion-eligibility.service.js';

export const assessPromotionEligibilityController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const assessedById = req.auth?.sub;

    if (!schoolId || !assessedById) {
      throw new AppError(
        'Authentication and school context required.',
        401
      );
    }

    const { studentId, enrollmentId, configurationId } = req.body;

    const data = await assessStudentPromotionEligibility(
      schoolId,
      assessedById,
      {
        studentId,
        enrollmentId,
        configurationId
      }
    );

    res.status(201).json({
      success: true,
      message: 'Promotion eligibility assessed.',
      data
    });
  }
);
