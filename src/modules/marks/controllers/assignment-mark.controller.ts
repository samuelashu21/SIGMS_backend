
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAssignmentMark,
  getAssignmentMarks
} from '../services/assignment-mark.service.js';

import {
  createMarkEntrySchema
} from '../validators/mark-entry.validator.js';

export const createAssignmentMarkController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const enteredById = req.auth?.sub;
    const assignmentId = req.params.assignmentId;

    if (!schoolId || !enteredById || !assignmentId) {
      throw new AppError('Assignment marks context required.', 400);
    }

    const input = createMarkEntrySchema
      .omit({ examinationId: true })
      .safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid assignment marks.', 400);
    }

    const data = await createAssignmentMark(
      schoolId,
      enteredById,
      assignmentId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Assignment marks entered successfully.',
      data
    });
  }
);

export const getAssignmentMarksController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const assignmentId = req.params.assignmentId;

    if (!schoolId || !assignmentId) {
      throw new AppError('Assignment context required.', 400);
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

    const result = await getAssignmentMarks(
      schoolId,
      assignmentId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      ...result
    });
  }
);
