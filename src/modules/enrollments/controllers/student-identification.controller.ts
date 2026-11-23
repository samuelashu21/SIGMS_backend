
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  assignStudentIdentificationNumber
} from '../services/student-identification.service.js';

export const assignStudentIdentificationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;

    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('Tenant context required.', 403);
    }

    if (
      typeof studentId !== 'string' ||
      !studentId.trim()
    ) {
      throw new AppError('Student ID required.', 400);
    }

    const data = await assignStudentIdentificationNumber(
      schoolId,
      studentId
    );

    res.status(200).json({
      success: true,
      message: 'Student identification number assigned.',
      data
    });
  }
);
