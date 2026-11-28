
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { teacherTimetableQuerySchema } from '../validators/teacher-timetable.validator.js';
import { getTeacherTimetable } from '../services/teacher-timetable.service.js';

export const getTeacherTimetableController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const requestingUserId = req.auth?.sub;
    const requestingRole = req.auth?.role;

    if (!schoolId || !requestingUserId || !requestingRole) {
      throw new AppError('Authentication and school context required.', 400);
    }

    const parsed = teacherTimetableQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError('Invalid teacher timetable filters.', 400);
    }

    const data = await getTeacherTimetable(
      schoolId,
      requestingUserId,
      requestingRole,
      parsed.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
