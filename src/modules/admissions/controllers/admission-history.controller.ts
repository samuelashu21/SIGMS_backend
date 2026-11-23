
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getAdmissionStatusHistory
} from '../services/admission-history.service.js';

export const getAdmissionStatusHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const applicationId = req.params.applicationId;

    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('Tenant context required.', 403);
    }

    if (
      typeof applicationId !== 'string' ||
      !applicationId.trim()
    ) {
      throw new AppError('Application ID required.', 400);
    }

    const data = await getAdmissionStatusHistory(
      schoolId,
      applicationId
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
