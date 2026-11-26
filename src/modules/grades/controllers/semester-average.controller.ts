
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  calculateSemesterAverageSchema,
  semesterAverageQuerySchema
} from '../validators/semester-average.validator.js';

import {
  calculateSemesterAverage,
  getSemesterAverageByStudent,
  getSemesterAverages
} from '../services/semester-average.service.js';

export const calculateSemesterAverageController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = calculateSemesterAverageSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid semester average request.', 400);
    }

    const data = await calculateSemesterAverage(
      schoolId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Semester average calculated successfully.',
      data
    });
  }
);

export const getSemesterAverageByStudentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;
    const academicYearId = req.query.academicYearId;
    const semesterId = req.query.semesterId;

    if (
      !schoolId ||
      typeof studentId !== 'string' ||
      typeof academicYearId !== 'string' ||
      typeof semesterId !== 'string'
    ) {
      throw new AppError(
        'Student, academic year and semester are required.',
        400
      );
    }

    const data = await getSemesterAverageByStudent(
      schoolId,
      studentId,
      academicYearId,
      semesterId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getSemesterAveragesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const query = semesterAverageQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError('Invalid semester average filters.', 400);
    }

    const data = await getSemesterAverages(
      schoolId,
      query.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
