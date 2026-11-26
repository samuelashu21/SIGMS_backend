
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  publishExaminationMarks,
  getPublishedExaminationMarks
} from '../services/mark-publication.service.js';

import {
  markPublicationQuerySchema
} from '../validators/mark-publication.validator.js';

/**
 * Publish examination marks
 */
export const publishExaminationMarksController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const publishedById = req.auth?.sub;

    const examinationId = req.params.examinationId;

    if (
      !schoolId ||
      !publishedById ||
      typeof examinationId !== 'string' ||
      !examinationId.trim()
    ) {
      throw new AppError(
        'Marks publication context required.',
        400
      );
    }

    const data = await publishExaminationMarks(
      schoolId,
      publishedById,
      examinationId
    );

    res.status(200).json({
      success: true,
      message: 'Examination marks published successfully.',
      data
    });
  }
);

/**
 * Get published examination marks
 */
export const getPublishedExaminationMarksController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const examinationId = req.params.examinationId;

    if (
      !schoolId ||
      typeof examinationId !== 'string' ||
      !examinationId.trim()
    ) {
      throw new AppError(
        'Examination context required.',
        400
      );
    }

    // Validate pagination query parameters
    const query = markPublicationQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError(
        'Invalid pagination parameters.',
        400
      );
    }

    const { page, limit } = query.data;

    const data = await getPublishedExaminationMarks(
      schoolId,
      examinationId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
