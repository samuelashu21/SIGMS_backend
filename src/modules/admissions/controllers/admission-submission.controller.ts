import type { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  submitAdmissionApplication
} from '../services/admission-submission.service.js';

export const submitAdmissionApplicationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const userId = req.auth?.sub;
    const applicationId = req.params.applicationId;

    if (!schoolId || !userId) {
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

    const data = await submitAdmissionApplication(
      schoolId,
      applicationId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Admission application submitted successfully.',
      data
    });
  }
);