
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createQuizMark,
  getQuizMarks
} from '../services/quiz-mark.service.js';

import {
  createMarkEntrySchema
} from '../validators/mark-entry.validator.js';

export const createQuizMarkController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const enteredById = req.auth?.sub;
    const quizId = req.params.quizId;

    if (!schoolId || !enteredById || !quizId) {
      throw new AppError('Quiz marks context required.', 400);
    }

    const input = createMarkEntrySchema
      .omit({ examinationId: true })
      .safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid quiz marks.', 400);
    }

    const data = await createQuizMark(
      schoolId,
      enteredById,
      quizId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Quiz marks entered successfully.',
      data
    });
  }
);

export const getQuizMarksController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const quizId = req.params.quizId;

    if (!schoolId || !quizId) {
      throw new AppError('Quiz context required.', 400);
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

    const result = await getQuizMarks(
      schoolId,
      quizId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...result
    });
  }
);
