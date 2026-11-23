import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAdmissionReview,
  getAdmissionReviews
} from '../services/admission-review.service.js';

import {
  createAdmissionReviewSchema
} from '../validators/admission-review.validator.js';

const getSchoolId = (req: Request): string => {
  const schoolId = req.tenant?.schoolId;

  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new AppError('Tenant context required.', 403);
  }

  return schoolId;
};

const getReviewerId = (req: Request): string => {
  const reviewerId = req.auth?.sub;

  if (typeof reviewerId !== 'string' || !reviewerId.trim()) {
    throw new AppError('Authenticated user required.', 401);
  }

  return reviewerId;
};

const getApplicationId = (req: Request): string => {
  const applicationId = req.params.applicationId;

  if (typeof applicationId !== 'string' || !applicationId.trim()) {
    throw new AppError('Application ID required.', 400);
  }

  return applicationId;
};

export const createAdmissionReviewController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = getSchoolId(req);
    const reviewerId = getReviewerId(req);
    const applicationId = getApplicationId(req);

    const input = createAdmissionReviewSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid admission review data.', 400);
    }

    const data = await createAdmissionReview(
      schoolId,
      applicationId,
      reviewerId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Application review recorded.',
      data
    });
  }
);

export const getAdmissionReviewsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = getSchoolId(req);
    const applicationId = getApplicationId(req);

    const data = await getAdmissionReviews(
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