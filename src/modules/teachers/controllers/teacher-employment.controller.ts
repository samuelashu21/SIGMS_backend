
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createTeacherEmployment,
  getTeacherEmploymentRecords,
  updateTeacherEmployment
} from '../services/teacher-employment.service.js';

import {
  createTeacherEmploymentSchema,
  updateTeacherEmploymentSchema
} from '../validators/teacher-employment.validator.js';

export const createTeacherEmploymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const input = createTeacherEmploymentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid employment information.', 400);
    }

    const data = await createTeacherEmployment(
      schoolId,
      teacherId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Teacher employment record created.',
      data
    });
  }
);

export const getTeacherEmploymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const data = await getTeacherEmploymentRecords(
      schoolId,
      teacherId
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const updateTeacherEmploymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    const employmentId = Array.isArray(req.params.employmentId)
      ? req.params.employmentId[0]
      : req.params.employmentId;

    if (!schoolId || !teacherId || !employmentId) {
      throw new AppError('Employment context required.', 400);
    }

    const input = updateTeacherEmploymentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid employment information.', 400);
    }

    const data = await updateTeacherEmployment(
      schoolId,
      teacherId,
      employmentId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Teacher employment record updated.',
      data
    });
  }
);
