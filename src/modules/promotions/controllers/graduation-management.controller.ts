
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  assessGraduationCandidateSchema,
  reviewGraduationCandidateSchema
} from '../validators/graduation-management.validator.js';

import {
  assessGraduationCandidate,
  getGraduationCandidates,
  reviewGraduationCandidate
} from '../services/graduation-management.service.js';

export const assessGraduationCandidateController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const assessedById = req.auth?.sub;

    if (!schoolId || !assessedById) {
      throw new AppError('School context required.', 400);
    }

    const parsed = assessGraduationCandidateSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid graduation assessment request.', 400);
    }

    const data = await assessGraduationCandidate(
      schoolId,
      assessedById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Graduation candidate assessed.',
      data
    });
  }
);

export const getGraduationCandidatesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const academicYearId = req.query.academicYearId;
    const status = req.query.status;

    if (!schoolId || typeof academicYearId !== 'string') {
      throw new AppError('Academic year is required.', 400);
    }

    const allowedStatuses = [
      'PENDING',
      'ELIGIBLE',
      'NOT_ELIGIBLE',
      'REVIEW_REQUIRED',
      'APPROVED',
      'REJECTED'
    ];

    if (
      status !== undefined &&
      (typeof status !== 'string' || !allowedStatuses.includes(status))
    ) {
      throw new AppError('Invalid graduation candidate status.', 400);
    }

    const data = await getGraduationCandidates(
      schoolId,
      academicYearId,
      status as
        | 'PENDING'
        | 'ELIGIBLE'
        | 'NOT_ELIGIBLE'
        | 'REVIEW_REQUIRED'
        | 'APPROVED'
        | 'REJECTED'
        | undefined
    );

    res.status(200).json({ success: true, data });
  }
);

export const reviewGraduationCandidateController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const reviewedById = req.auth?.sub;
    const candidateId = req.params.candidateId;

    if (!schoolId || !reviewedById || !candidateId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const parsed = reviewGraduationCandidateSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid graduation review.', 400);
    }

    const data = await reviewGraduationCandidate(
      schoolId,
      candidateId,
      reviewedById,
      parsed.data.decision,
      parsed.data.reviewNotes
    );

    res.status(200).json({
      success: true,
      message: 'Graduation candidate review saved.',
      data
    });
  }
);
