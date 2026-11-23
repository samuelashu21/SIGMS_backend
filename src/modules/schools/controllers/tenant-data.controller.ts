
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getSchoolStudents,
  getSchoolStudent
} from '../services/tenant-data.service.js';

export const getSchoolStudentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('Tenant context is required.', 403);
    }

    const students = await getSchoolStudents(schoolId);

    res.status(200).json({
      success: true,
      message: 'School students retrieved successfully.',
      data: students
    });
  }
);

export const getSchoolStudentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;

    if (!schoolId || !studentId) {
      throw new AppError('School and student context are required.', 400);
    }

    const student = await getSchoolStudent(
      schoolId,
      studentId
    );

    res.status(200).json({
      success: true,
      message: 'Student retrieved successfully.',
      data: student
    });
  }
);
