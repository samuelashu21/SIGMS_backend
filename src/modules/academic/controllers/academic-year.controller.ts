
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAcademicYear,
  getAcademicYears,
  getAcademicYear,
  updateAcademicYear,
  setCurrentAcademicYear
} from '../services/academic-year.service.js';

import {
  createAcademicYearSchema,
  updateAcademicYearSchema
} from '../validators/academic-year.validator.js';

/**
 * Get the authenticated tenant's school ID.
 */
const getSchoolId = (req: Request): string => {
  const schoolId = req.tenant?.schoolId;

  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new AppError('Tenant context required.', 403);
  }

  return schoolId;
};

/**
 * Validate and retrieve a route parameter as a string.
 */
const getRouteParam = (
  req: Request,
  paramName: string,
  errorMessage: string
): string => {
  const value = req.params[paramName];

  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(errorMessage, 400);
  }

  return value;
};

/**
 * Create an academic year.
 */
export const createAcademicYearController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createAcademicYearSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid academic year data.', 400);
    }

    const schoolId = getSchoolId(req);

    const data = await createAcademicYear(
      schoolId,
      input.data
    );

    res.status(201).json({
      success: true,
      data
    });
  }
);

/**
 * Retrieve all academic years for a school.
 */
export const getAcademicYearsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = getSchoolId(req);

    const data = await getAcademicYears(schoolId);

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Retrieve a specific academic year.
 */
export const getAcademicYearController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = getSchoolId(req);

    const academicYearId = getRouteParam(
      req,
      'academicYearId',
      'A valid Academic Year ID is required.'
    );

    const data = await getAcademicYear(
      schoolId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Update an academic year.
 */
export const updateAcademicYearController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = getSchoolId(req);

    const academicYearId = getRouteParam(
      req,
      'academicYearId',
      'A valid Academic Year ID is required.'
    );

    const input = updateAcademicYearSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid academic year data.', 400);
    }

    const data = await updateAcademicYear(
      schoolId,
      academicYearId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Set an academic year as the current academic year.
 */
export const setCurrentAcademicYearController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = getSchoolId(req);

    const academicYearId = getRouteParam(
      req,
      'academicYearId',
      'A valid Academic Year ID is required.'
    );

    const data = await setCurrentAcademicYear(
      schoolId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      message: 'Current academic year updated.',
      data
    });
  }
);
