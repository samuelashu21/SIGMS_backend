
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  scheduleExaminationSchema,
  examinationScheduleQuerySchema
} from '../validators/examination-schedule.validator.js';

import {
  scheduleExamination,
  getExaminationSchedule
} from '../services/examination-schedule.service.js';

export const scheduleExaminationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const performedById = req.auth?.sub;

    // Normalize and validate examination ID
    const examinationId = req.params.examinationId;

    if (
      !schoolId ||
      !performedById ||
      typeof examinationId !== 'string' ||
      !examinationId.trim()
    ) {
      throw new AppError(
        'Required request context is missing.',
        400
      );
    }

    // Validate request body
    const parsed = scheduleExaminationSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        'Invalid examination schedule.',
        400
      );
    }

    // Schedule examination
    const data = await scheduleExamination(
      schoolId,
      examinationId,
      performedById,
      parsed.data
    );

    res.status(200).json({
      success: true,
      message: 'Examination scheduled successfully.',
      data
    });
  }
);

// ============================================
// GET EXAMINATION SCHEDULE
// ============================================

export const getExaminationScheduleController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    // Validate query parameters
    const parsed = examinationScheduleQuerySchema.safeParse(
      req.query
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid examination schedule filters.',
        400
      );
    }

    // Fetch examination schedule
    const data = await getExaminationSchedule(
      schoolId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
