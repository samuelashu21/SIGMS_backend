
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createMarkCorrectionSchema,
  reviewMarkCorrectionSchema
} from '../validators/mark-correction.validator.js';

import {
  requestMarkCorrection,
  reviewMarkCorrection,
  getMarkCorrections,
  getPendingMarkCorrections
} from '../services/mark-correction.service.js';

// Safely retrieve and validate Express route parameters.
const getRouteParam = (req: Request, paramName: string): string => {
  const value = req.params[paramName];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`Valid ${paramName} required.`, 400);
  }

  return value.trim();
};

export const requestMarkCorrectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const requestedById = req.auth?.sub;
    const markRecordId = getRouteParam(req, 'markRecordId');

    if (!schoolId || !requestedById) {
      throw new AppError('Correction request context required.', 400);
    }

    const input = createMarkCorrectionSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid correction information.', 400);
    }

    const data = await requestMarkCorrection(
      schoolId,
      requestedById,
      markRecordId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Mark correction requested successfully.',
      data
    });
  }
);

export const reviewMarkCorrectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const reviewedById = req.auth?.sub;
    const correctionId = getRouteParam(req, 'correctionId');

    if (!schoolId || !reviewedById) {
      throw new AppError('Correction review context required.', 400);
    }

    const input = reviewMarkCorrectionSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid correction review.', 400);
    }

    const data = await reviewMarkCorrection(
      schoolId,
      reviewedById,
      correctionId,
      input.data.decision,
      input.data.reviewNotes
    );

    res.status(200).json({
      success: true,
      message: 'Correction request reviewed successfully.',
      data
    });
  }
);

export const getMarkCorrectionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const markRecordId = getRouteParam(req, 'markRecordId');

    if (!schoolId) {
      throw new AppError('Mark record context required.', 400);
    }

    const data = await getMarkCorrections(schoolId, markRecordId);

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getPendingMarkCorrectionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = getRouteParam(req, 'examinationId');

    if (!schoolId) {
      throw new AppError('Examination context required.', 400);
    }

    const data = await getPendingMarkCorrections(
      schoolId,
      examinationId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
