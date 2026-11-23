
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createTeacherProfile,
  getTeacherProfile,
  getTeachers,
  updateTeacherProfile
} from '../services/teacher-profile.service.js';

import {
  createTeacherProfileSchema,
  updateTeacherProfileSchema
} from '../validators/teacher-profile.validator.js';

export const createTeacherProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('Tenant context required.', 403);
    }

    const input = createTeacherProfileSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid teacher profile information.', 400);
    }

    const data = await createTeacherProfile(schoolId, input.data);

    res.status(201).json({
      success: true,
      message: 'Teacher profile created.',
      data
    });
  }
);

export const getTeacherProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const data = await getTeacherProfile(schoolId, teacherId);

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getTeachersController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('Tenant context required.', 403);
    }

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : undefined;

    const data = await getTeachers(schoolId, search);

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const updateTeacherProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const teacherId = Array.isArray(req.params.teacherId)
      ? req.params.teacherId[0]
      : req.params.teacherId;

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const input = updateTeacherProfileSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid teacher profile information.', 400);
    }

    const data = await updateTeacherProfile(
      schoolId,
      teacherId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Teacher profile updated.',
      data
    });
  }
);
