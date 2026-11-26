
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  scheduleExamination,
  getExaminationSchedule
} from '../services/examination-schedule.service.js';

import {
  scheduleExaminationSchema
} from '../validators/examination-schedule.validator.js';

import { z } from 'zod';

const scheduleQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional()
}).refine(
  (data) =>
    !data.startDate ||
    !data.endDate ||
    data.startDate <= data.endDate,
  {
    path: ['endDate'],
    message: 'Start date must not exceed end date.'
  }
);

export const scheduleExaminationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = req.params.examinationId;

    if (!schoolId || !examinationId) {
      throw new AppError('Examination scheduling context required.', 400);
    }

    const input = scheduleExaminationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid examination schedule.', 400);
    }

    const data = await scheduleExamination(
      schoolId,
      examinationId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Examination scheduled successfully.',
      data
    });
  }
);

export const getExaminationScheduleController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const filters = scheduleQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid examination schedule filters.', 400);
    }

    const data = await getExaminationSchedule(
      schoolId,
      filters.data
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
