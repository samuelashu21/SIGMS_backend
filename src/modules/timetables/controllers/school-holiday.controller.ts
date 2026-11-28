
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createSchoolHolidaySchema,
  updateSchoolHolidaySchema,
  schoolHolidayQuerySchema
} from '../validators/school-holiday.validator.js';

import {
  createSchoolHoliday,
  listSchoolHolidays,
  getSchoolHoliday,
  updateSchoolHoliday
} from '../services/school-holiday.service.js';

// ============================================
// CREATE SCHOOL HOLIDAY
// ============================================

export const createSchoolHolidayController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    const parsed = createSchoolHolidaySchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid school holiday data.',
        400
      );
    }

    const data = await createSchoolHoliday(
      schoolId,
      createdById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'School holiday created.',
      data
    });
  }
);

// ============================================
// LIST SCHOOL HOLIDAYS
// ============================================

export const listSchoolHolidaysController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    const parsed = schoolHolidayQuerySchema.safeParse(
      req.query
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid school holiday filters.',
        400
      );
    }

    const data = await listSchoolHolidays(
      schoolId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// GET SCHOOL HOLIDAY BY ID
// ============================================

export const getSchoolHolidayController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const holidayId = req.params.holidayId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    // Validate and narrow holiday ID type
    if (
      typeof holidayId !== 'string' ||
      !holidayId.trim()
    ) {
      throw new AppError(
        'Valid school holiday ID is required.',
        400
      );
    }

    const data = await getSchoolHoliday(
      schoolId,
      holidayId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// UPDATE SCHOOL HOLIDAY
// ============================================

export const updateSchoolHolidayController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const holidayId = req.params.holidayId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    // Validate and narrow holiday ID type
    if (
      typeof holidayId !== 'string' ||
      !holidayId.trim()
    ) {
      throw new AppError(
        'Valid school holiday ID is required.',
        400
      );
    }

    const parsed = updateSchoolHolidaySchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid school holiday update.',
        400
      );
    }

    const data = await updateSchoolHoliday(
      schoolId,
      holidayId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      message: 'School holiday updated.',
      data
    });
  }
);
