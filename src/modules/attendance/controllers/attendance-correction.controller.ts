
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAttendanceCorrection,
  getAttendanceCorrections,
  reviewAttendanceCorrection
} from '../services/attendance-correction.service.js';

import {
  createAttendanceCorrectionSchema,
  reviewAttendanceCorrectionSchema
} from '../validators/attendance-correction.validator.js';

export const createAttendanceCorrectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const requestedById = req.auth?.sub;

    if (!schoolId || !requestedById) {
      throw new AppError('Authentication context required.', 401);
    }

    const input = createAttendanceCorrectionSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid attendance correction request.', 400);
    }

    const data = await createAttendanceCorrection(
      schoolId,
      requestedById,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Attendance correction request submitted.',
      data
    });
  }
);

export const getAttendanceCorrectionsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const status = req.query.status;
    const attendanceRecordId = req.query.attendanceRecordId;

    if (
      status !== undefined &&
      !['PENDING', 'APPROVED', 'REJECTED'].includes(String(status))
    ) {
      throw new AppError('Invalid correction status.', 400);
    }

    const data = await getAttendanceCorrections(schoolId, {
      status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
      attendanceRecordId:
        typeof attendanceRecordId === 'string'
          ? attendanceRecordId
          : undefined
    });

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const reviewAttendanceCorrectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const correctionId = Array.isArray(req.params.correctionId)
      ? req.params.correctionId[0]
      : req.params.correctionId;

    const reviewedById = req.auth?.sub;

    if (!schoolId || !correctionId || !reviewedById) {
      throw new AppError('Correction review context required.', 400);
    }

    const input = reviewAttendanceCorrectionSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid correction review decision.', 400);
    }

    const data = await reviewAttendanceCorrection(
      schoolId,
      correctionId,
      reviewedById,
      input.data
    );

    res.status(200).json({
      success: true,
      message: `Attendance correction ${input.data.decision.toLowerCase()}.`,
      data
    });
  }
);
