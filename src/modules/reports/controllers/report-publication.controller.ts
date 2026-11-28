
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import { reportPublicationSchema } from '../validators/report-publication.validator.js';
import { updateReportPublication } from '../services/report-publication.service.js';

export const updateReportPublicationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const performedById = req.auth?.sub;

    if (!schoolId || !performedById) {
      throw new AppError('Authentication and school context required.', 401);
    }

    const parsed = reportPublicationSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid report publication request.', 400);
    }

    const data = await updateReportPublication(
      schoolId,
      performedById,
      parsed.data
    );

    res.status(200).json({
      success: true,
      message: parsed.data.action === 'PUBLISH'
        ? 'Report published successfully.'
        : 'Report withdrawn successfully.',
      data
    });
  }
);
