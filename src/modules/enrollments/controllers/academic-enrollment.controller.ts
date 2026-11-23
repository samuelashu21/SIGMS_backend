
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAcademicEnrollment,
  getStudentAcademicEnrollments
} from '../services/academic-enrollment.service.js';

import {
  createAcademicEnrollmentSchema
} from '../validators/academic-enrollment.validator.js';

export const createAcademicEnrollmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;
    const userId = req.auth?.sub;

    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('Tenant context required.', 403);
    }

    if (
      typeof studentId !== 'string' ||
      !studentId.trim()
    ) {
      throw new AppError('Student ID required.', 400);
    }

    if (!userId) {
      throw new AppError('Authenticated user required.', 401);
    }

    const input = createAcademicEnrollmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid academic enrollment data.', 400);
    }

    const data = await createAcademicEnrollment(
      schoolId,
      studentId,
      userId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Student academically enrolled.',
      data
    });
  }
);

export const getStudentAcademicEnrollmentsController = asyncHandler(
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

    const data = await getStudentAcademicEnrollments(
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
