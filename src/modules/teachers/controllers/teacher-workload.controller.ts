
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createTeacherWorkload,
  getTeacherWorkloadRecords,
  updateTeacherWorkload,
  getTeacherWorkloadSummary
} from '../services/teacher-workload.service.js';

import {
  createTeacherWorkloadSchema,
  updateTeacherWorkloadSchema
} from '../validators/teacher-workload.validator.js';

export const createTeacherWorkloadController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = req.params.teacherId;

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const input = createTeacherWorkloadSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid workload information.', 400);
    }

    const data = await createTeacherWorkload(
      schoolId,
      teacherId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Teacher workload record created.',
      data
    });
  }
);

export const getTeacherWorkloadRecordsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = req.params.teacherId;

    if (!schoolId || !teacherId) {
      throw new AppError('Teacher context required.', 400);
    }

    const academicYearId =
      typeof req.query.academicYearId === 'string'
        ? req.query.academicYearId
        : undefined;

    const data = await getTeacherWorkloadRecords(
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

export const updateTeacherWorkloadController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = req.params.teacherId;
    const workloadId = req.params.workloadId;

    if (!schoolId || !teacherId || !workloadId) {
      throw new AppError('Workload context required.', 400);
    }

    const input = updateTeacherWorkloadSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid workload information.', 400);
    }

    const data = await updateTeacherWorkload(
      schoolId,
      teacherId,
      workloadId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Teacher workload record updated.',
      data
    });
  }
);

export const getTeacherWorkloadSummaryController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const teacherId = req.params.teacherId;

    const academicYearId =
      typeof req.query.academicYearId === 'string'
        ? req.query.academicYearId
        : undefined;

    if (!schoolId || !teacherId || !academicYearId) {
      throw new AppError(
        'Teacher and academic year context required.',
        400
      );
    }

    const data = await getTeacherWorkloadSummary(
      schoolId,
      teacherId,
      academicYearId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
