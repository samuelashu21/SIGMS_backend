
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  assignHomeroomTeacher,
  getHomeroomTeacherAssignment,
  getTeacherHomeroomAssignments,
  updateHomeroomTeacherAssignment
} from '../services/homeroom-teacher-assignment.service.js';

import {
  createHomeroomAssignmentSchema,
  updateHomeroomAssignmentSchema
} from '../validators/homeroom-teacher-assignment.validator.js';

const getRouteParam = (
  value: string | string[] | undefined
): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

export const assignHomeroomTeacherController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const sectionId = getRouteParam(req.params.sectionId);

    if (!schoolId || !sectionId) {
      throw new AppError('Section context required.', 400);
    }

    const input = createHomeroomAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid homeroom assignment information.', 400);
    }

    const data = await assignHomeroomTeacher(
      schoolId,
      sectionId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Homeroom teacher assigned.',
      data
    });
  }
);

export const getHomeroomTeacherAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const sectionId = getRouteParam(req.params.sectionId);

    const academicYearId =
      typeof req.query.academicYearId === 'string'
        ? req.query.academicYearId
        : undefined;

    if (!schoolId || !sectionId || !academicYearId) {
      throw new AppError(
        'School, section, and academic year context required.',
        400
      );
    }

    const data = await getHomeroomTeacherAssignment(
      schoolId,
      sectionId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getTeacherHomeroomAssignmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = getRouteParam(req.params.teacherId);

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const academicYearId =
      typeof req.query.academicYearId === 'string'
        ? req.query.academicYearId
        : undefined;

    const data = await getTeacherHomeroomAssignments(
      schoolId,
      teacherId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const updateHomeroomTeacherAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const sectionId = getRouteParam(req.params.sectionId);
    const assignmentId = getRouteParam(req.params.assignmentId);

    if (!schoolId || !sectionId || !assignmentId) {
      throw new AppError('Homeroom assignment context required.', 400);
    }

    const input = updateHomeroomAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid homeroom assignment information.', 400);
    }

    const data = await updateHomeroomTeacherAssignment(
      schoolId,
      sectionId,
      assignmentId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Homeroom teacher assignment updated.',
      data
    });
  }
);
