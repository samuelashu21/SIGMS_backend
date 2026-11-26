
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createExamination,
  getExaminationById,
  getExaminations,
  updateExamination,
  deleteDraftExamination
} from '../services/examination.service.js';

import {
  createExaminationSchema,
  updateExaminationSchema,
  examinationListQuerySchema
} from '../validators/examination.validator.js';

export const createExaminationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError('Examination creation context required.', 400);
    }

    const input = createExaminationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid examination information.', 400);
    }

    const data = await createExamination(
      schoolId,
      createdById,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Examination created successfully.',
      data
    });
  }
);

export const getExaminationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = req.params.examinationId;

    if (!schoolId || !examinationId) {
      throw new AppError('Examination context required.', 400);
    }

    const data = await getExaminationById(
      schoolId,
      examinationId
    );

    res.status(200).json({ success: true, data });
  }
);

export const getExaminationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const filters = examinationListQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid examination filters.', 400);
    }

    const result = await getExaminations(
      schoolId,
      filters.data
    );

    res.status(200).json({
      success: true,
      ...result
    });
  }
);

export const updateExaminationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = req.params.examinationId;

    if (!schoolId || !examinationId) {
      throw new AppError('Examination context required.', 400);
    }

    const input = updateExaminationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid examination update.', 400);
    }

    const data = await updateExamination(
      schoolId,
      examinationId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Examination updated successfully.',
      data
    });
  }
);

export const deleteDraftExaminationController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const examinationId = req.params.examinationId;

    if (!schoolId || !examinationId) {
      throw new AppError('Examination context required.', 400);
    }

    await deleteDraftExamination(
      schoolId,
      examinationId
    );

    res.status(200).json({
      success: true,
      message: 'Draft examination deleted.'
    });
  }
);
