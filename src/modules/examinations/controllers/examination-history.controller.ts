
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getExaminationHistory
} from '../services/examination-history.service.js';

import {
  examinationHistoryQuerySchema
} from '../validators/examination-history.validator.js';

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
 * Get examination history with pagination.
 */
export const getExaminationHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = getExaminationId(req);

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        403
      );
    }

    // Validate pagination filters.
    const query = examinationHistoryQuerySchema.safeParse(
      req.query
    );

    if (!query.success) {
      throw new AppError(
        'Invalid history filters.',
        400
      );
    }

    // Retrieve examination history.
    const result = await getExaminationHistory(
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
