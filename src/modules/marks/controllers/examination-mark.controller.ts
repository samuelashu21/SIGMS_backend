
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createExaminationMark,
  getExaminationMarks
} from '../services/examination-mark.service.js';

import {
  createMarkEntrySchema
} from '../validators/mark-entry.validator.js';

export const createExaminationMarkController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const enteredById = req.auth?.sub;
    const examinationId = req.params.examinationId;

    if (!schoolId || !enteredById || !examinationId) {
      throw new AppError('Examination marks context required.', 400);
    }

    const input = createMarkEntrySchema
      .omit({ examinationId: true })
      .safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid examination marks.', 400);
    }

    const data = await createExaminationMark(
      schoolId,
      enteredById,
      examinationId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Examination marks entered successfully.',
      data
    });
  }
);

export const getExaminationMarksController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = req.params.examinationId;

    if (!schoolId || !examinationId) {
      throw new AppError('Examination context required.', 400);
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new AppError('Invalid pagination parameters.', 400);
    }

    const result = await getExaminationMarks(
      schoolId,
      examinationId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...result
    });
  }
);
