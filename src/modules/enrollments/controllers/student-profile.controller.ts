
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getStudentProfile,
  updateStudentProfile
} from '../services/student-profile.service.js';

import {
  updateStudentProfileSchema
} from '../validators/student-profile.validator.js';

export const getStudentProfileController = asyncHandler(
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

    const data = await getStudentProfile(schoolId, studentId);

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const updateStudentProfileController = asyncHandler(
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

    const input = updateStudentProfileSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid student profile information.',
        400
      );
    }

    const data = await updateStudentProfile(
      schoolId,
      studentId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Student profile updated.',
      data
    });
  }
);
