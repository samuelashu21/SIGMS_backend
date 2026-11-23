
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createTeacherQualification,
  getTeacherQualifications,
  updateTeacherQualification,
  deleteTeacherQualification
} from '../services/teacher-qualification.service.js';

import {
  createTeacherQualificationSchema,
  updateTeacherQualificationSchema
} from '../validators/teacher-qualification.validator.js';

const getRouteParam = (
  value: string | string[] | undefined
): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

export const createTeacherQualificationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = getRouteParam(req.params.teacherId);

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const input = createTeacherQualificationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid qualification information.', 400);
    }

    const data = await createTeacherQualification(
      schoolId,
      teacherId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Teacher qualification created.',
      data
    });
  }
);

export const getTeacherQualificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = getRouteParam(req.params.teacherId);

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const data = await getTeacherQualifications(schoolId, teacherId);

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const updateTeacherQualificationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = getRouteParam(req.params.teacherId);
    const qualificationId = getRouteParam(req.params.qualificationId);

    if (!schoolId || !teacherId || !qualificationId) {
      throw new AppError('Qualification context required.', 400);
    }

    const input = updateTeacherQualificationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid qualification information.', 400);
    }

    const data = await updateTeacherQualification(
      schoolId,
      teacherId,
      qualificationId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Teacher qualification updated.',
      data
    });
  }
);

export const deleteTeacherQualificationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = getRouteParam(req.params.teacherId);
    const qualificationId = getRouteParam(req.params.qualificationId);

    if (!schoolId || !teacherId || !qualificationId) {
      throw new AppError('Qualification context required.', 400);
    }

    const data = await deleteTeacherQualification(
      schoolId,
      teacherId,
      qualificationId
    );

    res.status(200).json({
      success: true,
      message: 'Teacher qualification deleted.',
      data
    });

    }
);
