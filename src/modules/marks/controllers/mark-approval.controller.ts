
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  markApprovalSchema
} from '../validators/mark-approval.validator.js';

import {
  reviewExaminationMarks,
  getMarksPendingApproval
} from '../services/mark-approval.service.js';

export const reviewExaminationMarksController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const reviewedById = req.auth?.sub;

    if (!schoolId || !reviewedById) {
      throw new AppError('Marks approval context required.', 400);
    }

    const input = markApprovalSchema.safeParse({
      ...req.body,
      examinationId: req.params.examinationId
    });

    if (!input.success) {
      throw new AppError('Invalid marks approval information.', 400);
    }

    const data = await reviewExaminationMarks(
      schoolId,
      reviewedById,
      input.data
    );

    res.status(200).json({
      success: true,
      message:
        input.data.decision === 'APPROVE'
          ? 'Marks approved successfully.'
          : 'Marks rejected successfully.',
      data
    });
  }
);

export const getMarksPendingApprovalController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = req.params.examinationId;

    if (!schoolId || !examinationId) {
      throw new AppError('Examination context required.', 400);
    }

    const data = await getMarksPendingApproval(
      schoolId,
      examinationId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
