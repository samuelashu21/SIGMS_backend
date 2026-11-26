
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  subjectWeightSchema,
  semesterWeightSchema,
  updateWeightSchema
} from '../validators/grade-weight.validator.js';

import {
  createSubjectWeight,
  createSemesterWeight,
  getSubjectWeights,
  getSemesterWeights,
  updateSubjectWeight,
  updateSemesterWeight
} from '../services/grade-weight.service.js';

import {
  calculateWeightedSubjectGrade,
  calculateWeightedSemesterAverage,
  calculateWeightedAnnualAverage
} from '../services/weighted-grade.service.js';

import { calculateSubjectGradeSchema } from '../validators/subject-grade.validator.js';
import { calculateSemesterAverageSchema } from '../validators/semester-average.validator.js';
import { calculateAnnualAverageSchema } from '../validators/annual-average.validator.js';

// ============================================
// CREATE SUBJECT WEIGHT
// ============================================

export const createSubjectWeightController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = subjectWeightSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid subject weight.', 400);
    }

    const data = await createSubjectWeight(schoolId, input.data);

    res.status(201).json({
      success: true,
      data
    });
  }
);

// ============================================
// CREATE SEMESTER WEIGHT
// ============================================

export const createSemesterWeightController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = semesterWeightSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid semester weight.', 400);
    }

    const data = await createSemesterWeight(schoolId, input.data);

    res.status(201).json({
      success: true,
      data
    });
  }
);

// ============================================
// GET SUBJECT WEIGHTS
// ============================================

export const getSubjectWeightsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const academicYearId = req.query.academicYearId;
    const gradeId = req.query.gradeId;

    if (
      !schoolId ||
      typeof academicYearId !== 'string' ||
      typeof gradeId !== 'string'
    ) {
      throw new AppError(
        'Academic year and grade are required.',
        400
      );
    }

    const data = await getSubjectWeights(
      schoolId,
      academicYearId,
      gradeId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// GET SEMESTER WEIGHTS
// ============================================

export const getSemesterWeightsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const academicYearId = req.query.academicYearId;

    if (
      !schoolId ||
      typeof academicYearId !== 'string'
    ) {
      throw new AppError('Academic year is required.', 400);
    }

    const data = await getSemesterWeights(
      schoolId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// UPDATE SUBJECT WEIGHT
// ============================================

export const updateSubjectWeightController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const weightId = req.params.weightId;

    if (
      !schoolId ||
      typeof weightId !== 'string'
    ) {
      throw new AppError(
        'Subject weight context required.',
        400
      );
    }

    const input = updateWeightSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid weight update.', 400);
    }

    const data = await updateSubjectWeight(
      schoolId,
      weightId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// UPDATE SEMESTER WEIGHT
// ============================================

export const updateSemesterWeightController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const weightId = req.params.weightId;

    if (
      !schoolId ||
      typeof weightId !== 'string'
    ) {
      throw new AppError(
        'Semester weight context required.',
        400
      );
    }

    const input = updateWeightSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid weight update.', 400);
    }

    const data = await updateSemesterWeight(
      schoolId,
      weightId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// CALCULATE WEIGHTED SUBJECT GRADE
// ============================================

export const calculateWeightedSubjectGradeController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = calculateSubjectGradeSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid calculation request.',
        400
      );
    }

    const data = await calculateWeightedSubjectGrade(
      schoolId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// CALCULATE WEIGHTED SEMESTER AVERAGE
// ============================================

export const calculateWeightedSemesterAverageController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = calculateSemesterAverageSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid calculation request.',
        400
      );
    }

    const data = await calculateWeightedSemesterAverage(
      schoolId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  });

// ============================================
// CALCULATE WEIGHTED ANNUAL AVERAGE
// ============================================

export const calculateWeightedAnnualAverageController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const input = calculateAnnualAverageSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError(
        'Invalid calculation request.',
        400
      );
    }

    const data = await calculateWeightedAnnualAverage(
      schoolId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  });
