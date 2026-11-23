
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createSection,
  getSections,
  getSection,
  updateSection
} from '../services/section.service.js';

import {
  createSectionSchema,
  updateSectionSchema
} from '../validators/section.validator.js';

/**
 * Get authenticated tenant school ID.
 */
const getSchoolId = (req: Request): string => {
  const schoolId = req.tenant?.schoolId;

  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new AppError('Tenant context required.', 403);
  }

  return schoolId;
};

/**
 * Validate and retrieve a route parameter.
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
 * Create a section.
 */
export const createSectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createSectionSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid section data.', 400);
    }

    const data = await createSection(
      getSchoolId(req),
      input.data
    );

    res.status(201).json({
      success: true,
      data
    });
  }
);

/**
 * Retrieve sections with optional filters.
 */
export const getSectionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const gradeId = req.query.gradeId;
    const academicYearId = req.query.academicYearId;
    const active = req.query.isActive;

    if (
      (gradeId !== undefined && typeof gradeId !== 'string') ||
      (academicYearId !== undefined && typeof academicYearId !== 'string') ||
      (
        active !== undefined &&
        active !== 'true' &&
        active !== 'false'
      )
    ) {
      throw new AppError('Invalid section filters.', 400);
    }

    const data = await getSections(getSchoolId(req), {
      ...(typeof gradeId === 'string' && { gradeId }),
      ...(typeof academicYearId === 'string' && { academicYearId }),
      ...(active !== undefined && {
        isActive: active === 'true'
      })
    });

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Retrieve a specific section.
 */
export const getSectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const sectionId = getRouteParam(
      req,
      'sectionId',
      'A valid Section ID is required.'
    );

    const data = await getSection(
      getSchoolId(req),
      sectionId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Update a section.
 */
export const updateSectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const sectionId = getRouteParam(
      req,
      'sectionId',
      'A valid Section ID is required.'
    );

    const input = updateSectionSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid section data.', 400);
    }

    const data = await updateSection(
      getSchoolId(req),
      sectionId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
