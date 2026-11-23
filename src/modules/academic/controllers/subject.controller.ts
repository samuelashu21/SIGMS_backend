
import type { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject
} from '../services/subject.service.js';

import {
  createSubjectSchema,
  updateSubjectSchema
} from '../validators/subject.validator.js';

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

export const createSubjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createSubjectSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid subject data.', 400);
    }

    const data = await createSubject(getSchoolId(req), input.data);

    res.status(201).json({
      success: true,
      data
    });
  }
);

export const getSubjectsController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getSubjects(getSchoolId(req));

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getSubjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const subjectId = getRouteParam(
      req,
      'subjectId',
      'Subject ID required.'
    );

    const data = await getSubject(getSchoolId(req), subjectId);

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const updateSubjectController = asyncHandler(
  async (req: Request, res: Response) => {
    const subjectId = getRouteParam(
      req,
      'subjectId',
      'Subject ID required.'
    );

    const input = updateSubjectSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid subject data.', 400);
    }

    const data = await updateSubject(
      getSchoolId(req),
      subjectId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
