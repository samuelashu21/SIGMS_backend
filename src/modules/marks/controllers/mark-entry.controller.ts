
import type { Request, Response } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createMarkEntry,
  updateMarkEntry,
  getMarkEntryById,
  getExaminationMarkEntries
} from '../services/mark-entry.service.js';

import {
  createMarkEntrySchema,
  updateMarkEntrySchema
} from '../validators/mark-entry.validator.js';

/**
 * Safely extract a route parameter.
 * Express parameters may be string | string[].
 */
const getRouteParam = (
  req: Request,
  paramName: string
): string => {
  const value = req.params[paramName];

  if (
    typeof value !== 'string' ||
    value.trim().length === 0
  ) {
    throw new AppError(
      `Valid ${paramName} required.`,
      400
    );
  }

  return value.trim();
};

/**
 * Marks list pagination schema.
 */
const markListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

/**
 * Create mark entry.
 */
export const createMarkEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const enteredById = req.auth?.sub;

    if (
      !schoolId ||
      typeof enteredById !== 'string' ||
      !enteredById.trim()
    ) {
      throw new AppError(
        'Marks entry context required.',
        400
      );
    }

    const input = createMarkEntrySchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid marks entry information.',
        400
      );
    }

    const data = await createMarkEntry(
      schoolId,
      enteredById,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Marks entered successfully.',
      data
    });
  }
);

/**
 * Update mark entry.
 */
export const updateMarkEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const enteredById = req.auth?.sub;
    const markRecordId = getRouteParam(
      req,
      'markRecordId'
    );

    if (
      !schoolId ||
      typeof enteredById !== 'string' ||
      !enteredById.trim()
    ) {
      throw new AppError(
        'Mark record context required.',
        400
      );
    }

    const input = updateMarkEntrySchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid marks update.',
        400
      );
    }

    const data = await updateMarkEntry(
      schoolId,
      markRecordId,
      enteredById,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Marks updated successfully.',
      data
    });
  }
);

/**
 * Get individual mark entry.
 */
export const getMarkEntryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const markRecordId = getRouteParam(
      req,
      'markRecordId'
    );

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        403
      );
    }

    const data = await getMarkEntryById(
      schoolId,
      markRecordId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

/**
 * Get all mark entries for an examination.
 */
export const getExaminationMarkEntriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = getRouteParam(
      req,
      'examinationId'
    );

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        403
      );
    }

    const query = markListQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError(
        'Invalid marks list filters.',
        400
      );
    }

    const result = await getExaminationMarkEntries(
      schoolId,
      examinationId,
      query.data.page,
      query.data.limit
    );

    res.status(200).json({
      success: true,
      ...result
    });
  }
);
