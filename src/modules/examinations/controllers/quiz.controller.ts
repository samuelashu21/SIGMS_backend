
import type { Request, Response } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createQuiz,
  getQuizById,
  getQuizzes,
  updateQuiz,
  deleteDraftQuiz
} from '../services/quiz.service.js';

import { createQuizSchema } from '../validators/quiz.validator.js';

const getRouteParam = (
  value: string | string[] | undefined
): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

const quizFiltersSchema = z.object({
  academicYearId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

const updateQuizSchema = z.object({
  durationMinutes: z.coerce.number().int().min(1).max(600).optional(),
  attemptsAllowed: z.coerce.number().int().min(1).max(20).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  showResultsImmediately: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  quizInstructions: z.string().trim().max(2000).optional()
});

export const createQuizController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError('Quiz creation context required.', 400);
    }

    const input = createQuizSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid quiz information.', 400);
    }

    const data = await createQuiz(
      schoolId,
      createdById,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully.',
      data
    });
  }
);

export const getQuizController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const quizId = getRouteParam(req.params.quizId);

    if (!schoolId || !quizId) {
      throw new AppError('Quiz context required.', 400);
    }

    const data = await getQuizById(schoolId, quizId);

    res.status(200).json({ success: true, data });
  }
);

export const getQuizzesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const filters = quizFiltersSchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid quiz filters.', 400);
    }

    const result = await getQuizzes(schoolId, filters.data);

    res.status(200).json({
      success: true,
      ...result
    });
  }
);

export const updateQuizController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const quizId = getRouteParam(req.params.quizId);

    if (!schoolId || !quizId) {
      throw new AppError('Quiz context required.', 400);
    }

    const input = updateQuizSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid quiz update.', 400);
    }

    const data = await updateQuiz(
      schoolId,
      quizId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully.',
      data
    });
  }
);

export const deleteDraftQuizController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const quizId = getRouteParam(req.params.quizId);

    if (!schoolId || !quizId) {
      throw new AppError('Quiz context required.', 400);
    }

    await deleteDraftQuiz(schoolId, quizId);

    res.status(200).json({
      success: true,
      message: 'Draft quiz deleted.'
    });
  }
);
