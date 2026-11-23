
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createStudentAcademicRecord,
  getStudentAcademicRecords
} from '../services/student-academic-record.service.js';

import {
  createStudentAcademicRecordSchema
} from '../validators/student-academic-record.validator.js';

export const createStudentAcademicRecordController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const studentId = Array.isArray(req.params.studentId)
      ? req.params.studentId[0]
      : req.params.studentId;

    const userId = req.auth?.sub;

    if (!schoolId || !studentId || !userId) {
      throw new AppError('Required student context is missing.', 400);
    }

    const input = createStudentAcademicRecordSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid academic record information.', 400);
    }

    const data = await createStudentAcademicRecord(
      schoolId,
      studentId,
      userId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Student academic record created.',
      data
    });
  }
);

export const getStudentAcademicRecordsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const studentId = Array.isArray(req.params.studentId)
      ? req.params.studentId[0]
      : req.params.studentId;

    if (!schoolId || !studentId) {
      throw new AppError('Required student context is missing.', 400);
    }

    const data = await getStudentAcademicRecords(
      schoolId,
      studentId
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
