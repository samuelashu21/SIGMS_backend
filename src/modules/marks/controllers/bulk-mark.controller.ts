
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  bulkMarkEntrySchema
} from '../validators/bulk-mark.validator.js';

import {
  createBulkMarkEntries
} from '../services/bulk-mark.service.js';

export const createBulkMarkEntriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const enteredById = req.auth?.sub;

    if (!schoolId || !enteredById) {
      throw new AppError('Bulk marks entry context required.', 400);
    }

    const input = bulkMarkEntrySchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid bulk marks information.', 400);
    }

    const data = await createBulkMarkEntries(
      schoolId,
      enteredById,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Bulk marks entered successfully.',
      data
    });
  }
);
