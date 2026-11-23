
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  updateAdmissionStatus
} from '../services/admission-status.service.js';

import {
  updateAdmissionStatusSchema
} from '../validators/admission-status.validator.js';

export const updateAdmissionStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const changedById = req.auth?.sub;
    const applicationId = req.params.applicationId;

    if (
      typeof schoolId !== 'string' ||
      !schoolId.trim() ||
      typeof changedById !== 'string' ||
      !changedById.trim()
    ) {
      throw new AppError(
        'Authenticated school context required.',
        403
      );
    }

    if (
      typeof applicationId !== 'string' ||
      !applicationId.trim()
    ) {
      throw new AppError('Application ID required.', 400);
    }

    const input = updateAdmissionStatusSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid admission status information.',
        400
      );
    }

    const data = await updateAdmissionStatus(
      schoolId,
      applicationId,
      changedById,
      input.data.status,
      input.data.reason
    );

    res.status(200).json({
      success: true,
      message: 'Admission status updated.',
      data
    });
  }
);
