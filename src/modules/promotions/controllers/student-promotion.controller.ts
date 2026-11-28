
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { promotionDecisionSchema } from '../validators/promotion-decision.validator.js';
import { promoteStudent } from '../services/student-promotion.service.js';

export const promoteStudentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const decidedById = req.auth?.sub;
    const decisionMakerRole = req.auth?.role;

    if (!schoolId || !decidedById || !decisionMakerRole) {
      throw new AppError('Authentication and school context required.', 401);
    }

    const parsed = promotionDecisionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid promotion decision.', 400);
    }

    const data = await promoteStudent(
      schoolId,
      decidedById,
      decisionMakerRole,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Student promoted successfully.',
      data
    });
  }
);
