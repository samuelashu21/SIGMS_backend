
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createStudentGuardianRelationship,
  getStudentGuardianRelationships,
  getGuardianStudentRelationships
} from '../services/student-guardian.service.js';

import {
  createStudentGuardianSchema
} from '../validators/student-guardian.validator.js';

export const createStudentGuardianController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const input = createStudentGuardianSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid student-guardian information.', 400);
    }

    const data = await createStudentGuardianRelationship(
      schoolId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Student-guardian relationship created and pending verification.',
      data
    });
  }
);

export const getStudentGuardianRelationshipsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    if (typeof studentId !== 'string' || !studentId.trim()) {
      throw new AppError('Valid student ID is required.', 400);
    }

    const data = await getStudentGuardianRelationships(
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

export const getGuardianStudentRelationshipsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const guardianId = req.params.guardianId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    if (typeof guardianId !== 'string' || !guardianId.trim()) {
      throw new AppError('Valid guardian ID is required.', 400);
    }

    const data = await getGuardianStudentRelationships(
      schoolId,
      guardianId
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);
