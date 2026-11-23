
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAdmissionApplication,
  getAdmissionApplications,
  getAdmissionApplication,
  updateAdmissionApplication
} from '../services/admission-application.service.js';

import {
  createAdmissionApplicationSchema,
  updateAdmissionApplicationSchema,
  admissionApplicationQuerySchema
} from '../validators/admission-application.validator.js';

const getSchoolId = (req: Request): string => {
  const schoolId = req.tenant?.schoolId;

  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new AppError('Tenant context required.', 403);
  }

  return schoolId;
};

const getUserId = (req: Request): string => {
  const userId = req.auth?.sub;

  if (typeof userId !== 'string' || !userId.trim()) {
    throw new AppError('Authenticated user required.', 401);
  }

  return userId;
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

export const createAdmissionApplicationController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createAdmissionApplicationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid admission application data.', 400);
    }

    const data = await createAdmissionApplication(
      getSchoolId(req),
      getUserId(req),
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Admission application created.',
      data
    });
  }
);

export const getAdmissionApplicationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = admissionApplicationQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid admission application filters.', 400);
    }

    const data = await getAdmissionApplications(
      getSchoolId(req),
      filters.data
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const getAdmissionApplicationController = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getRouteParam(
      req,
      'applicationId',
      'Application ID required.'
    );

    const data = await getAdmissionApplication(
      getSchoolId(req),
      applicationId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const updateAdmissionApplicationController = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getRouteParam(
      req,
      'applicationId',
      'Application ID required.'
    );

    const input = updateAdmissionApplicationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid admission application data.', 400);
    }

    const data = await updateAdmissionApplication(
      getSchoolId(req),
      applicationId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Admission application updated.',
      data
    });
  }
);
