
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createGraduationRecordSchema,
  revokeGraduationRecordSchema
} from '../validators/graduation-record.validator.js';

import {
  createGraduationRecord,
  getGraduationRecord,
  getStudentGraduationRecords,
  revokeGraduationRecord
} from '../services/graduation-record.service.js';

export const createGraduationRecordController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const approvedById = req.auth?.sub;

    if (!schoolId || !approvedById) {
      throw new AppError('School context required.', 400);
    }

    const parsed = createGraduationRecordSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid graduation record.', 400);
    }

    const data = await createGraduationRecord(
      schoolId,
      approvedById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Graduation record created.',
      data
    });
  }
);

export const getGraduationRecordController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const recordId = req.params.recordId;

    if (!schoolId || !recordId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const data = await getGraduationRecord(schoolId, recordId);

    res.status(200).json({ success: true, data });
  }
);

export const getStudentGraduationRecordsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;

    if (!schoolId || !studentId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const data = await getStudentGraduationRecords(
      schoolId,
      studentId
    );

    res.status(200).json({ success: true, data });
  }
);

export const revokeGraduationRecordController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const revokedById = req.auth?.sub;
    const recordId = req.params.recordId;

    if (!schoolId || !revokedById || !recordId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const parsed = revokeGraduationRecordSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid revocation request.', 400);
    }

    const data = await revokeGraduationRecord(
      schoolId,
      recordId,
      revokedById,
      parsed.data.reason
    );

    res.status(200).json({
      success: true,
      message: 'Graduation record revoked.',
      data
    });
  }
);
