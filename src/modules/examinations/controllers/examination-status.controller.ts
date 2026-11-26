
import type { Request, Response } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  updateExaminationStatus,
  getExaminationsByStatus
} from '../services/examination-status.service.js';

import {
  updateExaminationStatusSchema
} from '../validators/examination-status.validator.js';

/**
 * Validate and extract examination ID.
 */
const getExaminationId = (req: Request): string => {
  const examinationId = req.params.examinationId;

  if (
    typeof examinationId !== 'string' ||
    examinationId.trim().length === 0
  ) {
    throw new AppError('Valid examination ID required.', 400);
  }

  return examinationId.trim();
};

/**
 * Examination status query validation schema.
 */
const statusQuerySchema = z.object({
  status: z.enum([
    'DRAFT',
    'SCHEDULED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED'
  ]),
  academicYearId: z.string().uuid().optional()
});

/**
 * Update examination status and record history.
 */
export const updateExaminationStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = getExaminationId(req);
    const performedById = req.auth?.sub;

    if (
      !schoolId ||
      typeof performedById !== 'string' ||
      !performedById.trim()
    ) {
      throw new AppError(
        'Examination context required.',
        400
      );
    }

    const input = updateExaminationStatusSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid examination status update.',
        400
      );
    }

    const data = await updateExaminationStatus(
      schoolId,
      examinationId,
      performedById,
      input.data.status,
      input.data.reason
    );

    res.status(200).json({
      success: true,
      message: 'Examination status updated successfully.',
      data
    });
  }
);

/**
 * Get examinations filtered by status.
 */
export const getExaminationsByStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const filters = statusQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError(
        'Invalid examination status filters.',
        400
      );
    }

    const data = await getExaminationsByStatus(
      schoolId,
      filters.data.status,
      filters.data.academicYearId
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
