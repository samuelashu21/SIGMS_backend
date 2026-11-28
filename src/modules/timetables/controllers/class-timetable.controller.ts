
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createClassTimetableSchema,
  classTimetableQuerySchema
} from '../validators/class-timetable.validator.js';

import {
  createClassTimetable,
  getClassTimetable,
  listClassTimetables
} from '../services/class-timetable.service.js';

// ============================================
// CREATE CLASS TIMETABLE
// ============================================

export const createClassTimetableController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    const parsed = createClassTimetableSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        'Invalid class timetable data.',
        400
      );
    }

    const data = await createClassTimetable(
      schoolId,
      createdById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Class timetable created as a draft.',
      data
    });
  }
);

// ============================================
// GET CLASS TIMETABLE BY ID
// ============================================

export const getClassTimetableController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const timetableId = req.params.timetableId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    // Validate and narrow timetable ID type
    if (
      typeof timetableId !== 'string' ||
      !timetableId.trim()
    ) {
      throw new AppError(
        'Valid timetable ID is required.',
        400
      );
    }

    const data = await getClassTimetable(
      schoolId,
      timetableId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// LIST CLASS TIMETABLES
// ============================================

export const listClassTimetablesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    const parsed = classTimetableQuerySchema.safeParse(
      req.query
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid timetable filters.',
        400
      );
    }

    const data = await listClassTimetables(
      schoolId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      data
    });

    }
);
