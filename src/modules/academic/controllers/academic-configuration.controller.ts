
import type { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getAcademicConfiguration,
  createAcademicConfiguration,
  updateAcademicConfiguration
} from '../services/academic-configuration.service.js';

import {
  academicConfigurationSchema
} from '../validators/academic-configuration.validator.js';

const getSchoolId = (req: Request) => {
  const schoolId = req.tenant?.schoolId;
  if (!schoolId) throw new AppError('Tenant context required.', 403);
  return schoolId;
};

export const getAcademicConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await getAcademicConfiguration(getSchoolId(req));
    res.status(200).json({ success: true, data });
  }
);

export const createAcademicConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await createAcademicConfiguration(getSchoolId(req));
    res.status(201).json({ success: true, data });
  }
);

export const updateAcademicConfigurationController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = academicConfigurationSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid academic configuration.', 400);
    }

    const data = await updateAcademicConfiguration(
      getSchoolId(req),
      input.data
    );

    res.status(200).json({ success: true, data });
  }
);
