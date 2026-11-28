
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createTimetableConfigurationSchema,
  updateTimetableConfigurationSchema
} from '../validators/timetable-configuration.validator.js';

import {
  createTimetableConfiguration,
  getTimetableConfigurations,
  getTimetableConfiguration,
  updateTimetableConfiguration
} from '../services/timetable-configuration.service.js';

// ============================================
// CREATE TIMETABLE CONFIGURATION
// ============================================

export const createTimetableConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    const parsed = createTimetableConfigurationSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid timetable configuration.',
        400
      );
    }

    const data = await createTimetableConfiguration(
      schoolId,
      createdById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Timetable configuration created.',
      data
    });
  }
);

// ============================================
// GET ALL TIMETABLE CONFIGURATIONS
// ============================================

export const getTimetableConfigurationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    const academicYearId =
      typeof req.query.academicYearId === 'string' &&
      req.query.academicYearId.trim()
        ? req.query.academicYearId
        : undefined;

    const data = await getTimetableConfigurations(
      schoolId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// GET TIMETABLE CONFIGURATION BY ID
// ============================================

export const getTimetableConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const configurationId = req.params.configurationId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    // Validate route parameter
    if (
      typeof configurationId !== 'string' ||
      !configurationId.trim()
    ) {
      throw new AppError(
        'Valid timetable configuration ID is required.',
        400
      );
    }

    const data = await getTimetableConfiguration(
      schoolId,
      configurationId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// UPDATE TIMETABLE CONFIGURATION
// ============================================

export const updateTimetableConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const configurationId = req.params.configurationId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    // Validate route parameter
    if (
      typeof configurationId !== 'string' ||
      !configurationId.trim()
    ) {
      throw new AppError(
        'Valid timetable configuration ID is required.',
        400
      );
    }

    const parsed = updateTimetableConfigurationSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid timetable configuration update.',
        400
      );
    }

    const data = await updateTimetableConfiguration(
      schoolId,
      configurationId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      message: 'Timetable configuration updated.',
      data
    });
  }
);
