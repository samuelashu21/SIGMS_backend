
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createStudentTransfer,
  decideStudentTransfer,
  getStudentTransfers
} from '../services/student-transfer.service.js';

import {
  createStudentTransferSchema,
  decideStudentTransferSchema
} from '../validators/student-transfer.validator.js';

export const createStudentTransferController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const studentId = Array.isArray(req.params.studentId)
      ? req.params.studentId[0]
      : req.params.studentId;

    const userId = req.auth?.sub;

    if (!schoolId || !userId || !studentId) {
      throw new AppError('Required transfer context is missing.', 400);
    }

    const input = createStudentTransferSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid student transfer information.', 400);
    }

    const data = await createStudentTransfer(
      schoolId,
      studentId,
      userId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Student transfer request created.',
      data
    });
  }
);

export const decideStudentTransferController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const transferId = Array.isArray(req.params.transferId)
      ? req.params.transferId[0]
      : req.params.transferId;

    const userId = req.auth?.sub;

    if (!schoolId || !userId || !transferId) {
      throw new AppError('Required transfer context is missing.', 400);
    }

    const input = decideStudentTransferSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid transfer decision.', 400);
    }

    const data = await decideStudentTransfer(
      schoolId,
      transferId,
      userId,
      input.data.decision,
      input.data.decisionReason
    );

    res.status(200).json({
      success: true,
      message: 'Transfer decision recorded.',
      data
    });
  }
);

export const getStudentTransfersController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const studentId = Array.isArray(req.params.studentId)
      ? req.params.studentId[0]
      : req.params.studentId;

    if (!schoolId || !studentId) {
      throw new AppError('Required transfer context is missing.', 400);
    }

    const data = await getStudentTransfers(schoolId, studentId);

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
