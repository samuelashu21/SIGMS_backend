
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  assignStudentGrade,
  getStudentGradeAssignments
} from '../services/grade-assignment.service.js';

import {
  gradeAssignmentSchema
} from '../validators/grade-assignment.validator.js';

export const assignStudentGradeController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const enrollmentId = req.params.enrollmentId;

    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('Tenant context required.', 403);
    }

    if (
      typeof enrollmentId !== 'string' ||
      !enrollmentId.trim()
    ) {
      throw new AppError('Enrollment ID required.', 400);
    }

    const input = gradeAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid grade assignment data.', 400);
    }

    const data = await assignStudentGrade(
      schoolId,
      enrollmentId,
      input.data.gradeId
    );

    res.status(200).json({
      success: true,
      message: 'Student grade assigned successfully.',
      data
    });
  }
);

export const getStudentGradeAssignmentsController = asyncHandler(
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

    const data = await getStudentGradeAssignments(
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
