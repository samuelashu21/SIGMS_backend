
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createSemester,
  getSemesters,
  updateSemester,
  setCurrentSemester
} from '../services/semester.service.js';

import {
  createSemesterSchema,
  updateSemesterSchema
} from '../validators/semester.validator.js';

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
 * Validate and retrieve a single route parameter.
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
 * Create a semester.
 */
export const createSemesterController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createSemesterSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid semester data.', 400);
    }

    const schoolId = getSchoolId(req);

    const data = await createSemester(schoolId, input.data);

    res.status(201).json({
      success: true,
      data
    });
  }
);

/**
 * Retrieve semesters for an academic year.
 */
export const getSemestersController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = getSchoolId(req);

    const academicYearId = getRouteParam(
      req,
      'academicYearId',
      'A valid Academic Year ID is required.'
    );

    const data = await getSemesters(
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
 * Update a semester.
 */
export const updateSemesterController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = getSchoolId(req);

    const semesterId = getRouteParam(
      req,
      'semesterId',
      'A valid Semester ID is required.'
    );

    const input = updateSemesterSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid semester data.', 400);
    }

    const data = await updateSemester(
      schoolId,
      semesterId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Set a semester as the current semester.
 */
export const setCurrentSemesterController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = getSchoolId(req);

    const semesterId = getRouteParam(
      req,
      'semesterId',
      'A valid Semester ID is required.'
    );

    const data = await setCurrentSemester(
      schoolId,
      semesterId
    );

    res.status(200).json({
      success: true,
      message: 'Current semester updated.',
      data
    });
  }
);
