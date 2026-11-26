
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  markSubmissionSchema,
  markSubmissionQuerySchema
} from '../validators/mark-submission.validator.js';

import {
  submitExaminationMarks,
  getSubmittedExaminationMarks
} from '../services/mark-submission.service.js';

export const submitExaminationMarksController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const submittedById = req.auth?.sub;

    if (!schoolId || !submittedById) {
      throw new AppError('Marks submission context required.', 400);
    }

    const input = markSubmissionSchema.safeParse({
      examinationId: req.params.examinationId
    });

    if (!input.success) {
      throw new AppError('Invalid examination ID.', 400);
    }

    const data = await submitExaminationMarks(
      schoolId,
      submittedById,
      input.data.examinationId
    );

    res.status(200).json({
      success: true,
      message: 'Marks submitted successfully.',
      data
    });
  }
);

export const getSubmittedExaminationMarksController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = req.params.examinationId;

    if (!schoolId || !examinationId) {
      throw new AppError('Examination context required.', 400);
    }

    const query = markSubmissionQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError('Invalid pagination parameters.', 400);
    }

    const data = await getSubmittedExaminationMarks(
      schoolId,
      examinationId,
      query.data.page,
      query.data.limit
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
