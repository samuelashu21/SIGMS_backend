
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { studentRetentionSchema } from '../validators/student-retention.validator.js';
import { retainStudent } from '../services/student-retention.service.js';

export const retainStudentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const decidedById = req.auth?.sub;
    const decisionMakerRole = req.auth?.role;

    if (!schoolId || !decidedById || !decisionMakerRole) {
      throw new AppError(
        'Authentication and school context required.',
        401
      );
    }

    const parsed = studentRetentionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid student retention request.', 400);
    }

    const data = await retainStudent(
      schoolId,
      decidedById,
      decisionMakerRole,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Student retained successfully.',
      data
    });
  }
);
