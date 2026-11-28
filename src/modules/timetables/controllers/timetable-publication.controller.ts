
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  submitTimetableSchema,
  approveTimetableSchema,
  publishTimetableSchema
} from '../validators/timetable-publication.validator.js';

import {
  submitTimetable,
  approveTimetable,
  publishTimetable,
  getPublishedSectionTimetable
} from '../services/timetable-publication.service.js';

export const submitTimetableController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const userId = req.auth?.sub;

    if (!schoolId || !userId || !req.params.timetableId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const parsed = submitTimetableSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid timetable submission.', 400);
    }

    const data = await submitTimetable(
      schoolId,
      req.params.timetableId,
      userId,
      parsed.data.remarks
    );

    res.status(200).json({
      success: true,
      message: 'Timetable submitted for approval.',
      data
    });
  }
);

export const approveTimetableController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const userId = req.auth?.sub;

    if (!schoolId || !userId || !req.params.timetableId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const parsed = approveTimetableSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid timetable approval.', 400);
    }

    const data = await approveTimetable(
      schoolId,
      req.params.timetableId,
      userId,
      parsed.data.remarks
    );

    res.status(200).json({
      success: true,
      message: 'Timetable approved.',
      data
    });
  }
);

export const publishTimetableController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const userId = req.auth?.sub;

    if (!schoolId || !userId || !req.params.timetableId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const parsed = publishTimetableSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid timetable publication.', 400);
    }

    const data = await publishTimetable(
      schoolId,
      req.params.timetableId,
      userId,
      parsed.data.remarks
    );

    res.status(200).json({
      success: true,
      message: 'Timetable published.',
      data
    });
  }
);

export const getPublishedSectionTimetableController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const { sectionId, academicYearId } = req.query;

    if (
      !schoolId ||
      typeof sectionId !== 'string' ||
      typeof academicYearId !== 'string'
    ) {
      throw new AppError(
        'Section ID and academic year ID are required.',
        400
      );
    }

    const data = await getPublishedSectionTimetable(
      schoolId,
      sectionId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
