
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getStudentAcademicProgressionHistory,
  getSchoolAcademicProgressionHistory
} from '../services/academic-progression-history.service.js';

const actions = [
  'ENROLLED',
  'PROMOTED',
  'RETAINED',
  'GRADUATED',
  'CORRECTED'
] as const;

export const getStudentAcademicProgressionHistoryController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;

    if (!schoolId || !studentId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const data = await getStudentAcademicProgressionHistory(
      schoolId,
      studentId
    );

    res.status(200).json({
      success: true,
      data
    });
  });

export const getSchoolAcademicProgressionHistoryController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const academicYearId =
      typeof req.query.academicYearId === 'string'
        ? req.query.academicYearId
        : undefined;

    const action =
      typeof req.query.action === 'string'
        ? req.query.action
        : undefined;

    if (
      action &&
      !actions.includes(action as typeof actions[number])
    ) {
      throw new AppError('Invalid progression action.', 400);
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1
    ) {
      throw new AppError('Invalid pagination parameters.', 400);
    }

    const data = await getSchoolAcademicProgressionHistory(
      schoolId,
      {
        academicYearId,
        action: action as typeof actions[number] | undefined,
        page,
        limit
      }
    );

    res.status(200).json({
      success: true,
      data
    });
  });
