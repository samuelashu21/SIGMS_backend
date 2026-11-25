
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getGuardianChildren,
  getGuardianChildDetails
} from '../services/guardian-child-access.service.js';

export const getGuardianChildrenController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const userId = req.auth?.sub;

    if (!schoolId || !userId) {
      throw new AppError('Guardian authentication required.', 401);
    }

    const data = await getGuardianChildren(schoolId, userId);

    res.status(200).json({
      success: true,
      results: data.children.length,
      data
    });
  }
);

export const getGuardianChildDetailsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const userId = req.auth?.sub;
    const studentId = req.params.studentId;

    if (!schoolId || !userId) {
      throw new AppError('Guardian authentication required.', 401);
    }

    if (typeof studentId !== 'string' || !studentId.trim()) {
      throw new AppError('A valid student ID is required.', 400);
    }

    const data = await getGuardianChildDetails(
      schoolId,
      userId,
      studentId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
