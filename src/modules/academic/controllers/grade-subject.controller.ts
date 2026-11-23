
import type { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  assignSubjectToGrade,
  getGradeSubjectAssignments,
  updateGradeSubjectAssignment,
  removeGradeSubjectAssignment
} from '../services/grade-subject.service.js';

import {
  createGradeSubjectSchema,
  updateGradeSubjectSchema
} from '../validators/grade-subject.validator.js';

const getSchoolId = (req: Request): string => {
  const schoolId = req.tenant?.schoolId;

  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new AppError('Tenant context required.', 403);
  }

  return schoolId;
};

const getRouteParam = (
  req: Request,
  paramName: string,
  errorMessage: string
): string => {
  const value = req.params[paramName];

  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(errorMessage, 400);
  }

  return value;
};

export const assignSubjectToGradeController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createGradeSubjectSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid subject assignment.', 400);
    }

    const data = await assignSubjectToGrade(
      getSchoolId(req),
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Subject assigned to grade successfully.',
      data
    });
  }
);

export const getGradeSubjectAssignmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const gradeId = getRouteParam(
      req,
      'gradeId',
      'Grade ID required.'
    );

    const data = await getGradeSubjectAssignments(
      getSchoolId(req),
      gradeId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const updateGradeSubjectAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const assignmentId = getRouteParam(
      req,
      'assignmentId',
      'Assignment ID required.'
    );

    const input = updateGradeSubjectSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid assignment data.', 400);
    }

    const data = await updateGradeSubjectAssignment(
      getSchoolId(req),
      assignmentId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const removeGradeSubjectAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const assignmentId = getRouteParam(
      req,
      'assignmentId',
      'Assignment ID required.'
    );

    const data = await removeGradeSubjectAssignment(
      getSchoolId(req),
      assignmentId
    );

    res.status(200).json({
      success: true,
      message: 'Subject assignment deactivated.',
      data
    });
  }
);
