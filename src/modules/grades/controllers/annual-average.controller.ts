
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  calculateAnnualAverageSchema,
  annualAverageQuerySchema
} from '../validators/annual-average.validator.js';

import {
  calculateAnnualAverage,
  getAnnualAverageByStudent,
  getAnnualAverages
} from '../services/annual-average.service.js';

export const calculateAnnualAverageController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = calculateAnnualAverageSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid annual average request.', 400);
    }

    const data = await calculateAnnualAverage(
      schoolId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Annual average calculated successfully.',
      data
    });
  }
);

export const getAnnualAverageByStudentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const studentId = req.params.studentId;
    const academicYearId = req.query.academicYearId;

    if (
      !schoolId ||
      typeof studentId !== 'string' ||
      typeof academicYearId !== 'string'
    ) {
      throw new AppError(
        'Student and academic year are required.',
        400
      );
    }

    const data = await getAnnualAverageByStudent(
      schoolId,
      studentId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getAnnualAveragesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const query = annualAverageQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError('Invalid annual average filters.', 400);
    }

    const data = await getAnnualAverages(
      schoolId,
      query.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
