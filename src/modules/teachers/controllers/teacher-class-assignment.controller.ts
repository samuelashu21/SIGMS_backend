
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createTeacherClassAssignment,
  getTeacherClassAssignments,
  updateTeacherClassAssignment
} from '../services/teacher-class-assignment.service.js';

import {
  createTeacherClassAssignmentSchema,
  updateTeacherClassAssignmentSchema
} from '../validators/teacher-class-assignment.validator.js';

export const createTeacherClassAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId =
      typeof req.params.teacherId === 'string'
        ? req.params.teacherId
        : undefined;

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const input = createTeacherClassAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid class assignment information.', 400);
    }

    const data = await createTeacherClassAssignment(
      schoolId,
      teacherId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Teacher class assignment created.',
      data
    });
  }
);

export const getTeacherClassAssignmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId =
      typeof req.params.teacherId === 'string'
        ? req.params.teacherId
        : undefined;

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const academicYearId =
      typeof req.query.academicYearId === 'string'
        ? req.query.academicYearId
        : undefined;

    const data = await getTeacherClassAssignments(
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

export const updateTeacherClassAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const teacherId =
      typeof req.params.teacherId === 'string'
        ? req.params.teacherId
        : undefined;

    const assignmentId =
      typeof req.params.assignmentId === 'string'
        ? req.params.assignmentId
        : undefined;

    if (!schoolId || !teacherId || !assignmentId) {
      throw new AppError('Assignment context required.', 400);
    }

    const input = updateTeacherClassAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid class assignment information.', 400);
    }

    const data = await updateTeacherClassAssignment(
      schoolId,
      teacherId,
      assignmentId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Teacher class assignment updated.',
      data
    });
  }
);
