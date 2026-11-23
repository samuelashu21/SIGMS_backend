
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createTeacherSubjectAssignment,
  getTeacherSubjectAssignments,
  updateTeacherSubjectAssignment
} from '../services/teacher-subject-assignment.service.js';

import {
  createTeacherSubjectAssignmentSchema,
  updateTeacherSubjectAssignmentSchema
} from '../validators/teacher-subject-assignment.validator.js';

const getRouteParam = (
  value: string | string[] | undefined
): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

export const createTeacherSubjectAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = getRouteParam(req.params.teacherId);

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const input = createTeacherSubjectAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid subject assignment information.', 400);
    }

    const data = await createTeacherSubjectAssignment(
      schoolId,
      teacherId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Teacher subject assignment created.',
      data
    });
  }
);

export const getTeacherSubjectAssignmentsController = asyncHandler(
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

    const data = await getTeacherSubjectAssignments(
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

export const updateTeacherSubjectAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = getRouteParam(req.params.teacherId);
    const assignmentId = getRouteParam(req.params.assignmentId);

    if (!schoolId || !teacherId || !assignmentId) {
      throw new AppError('Assignment context required.', 400);
    }

    const input = updateTeacherSubjectAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid subject assignment information.', 400);
    }

    const data = await updateTeacherSubjectAssignment(
      schoolId,
      teacherId,
      assignmentId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Teacher subject assignment updated.',
      data
    });
  }
);
