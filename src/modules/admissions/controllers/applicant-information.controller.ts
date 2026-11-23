
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  getApplicantInformation,
  saveApplicantInformation
} from '../services/applicant-information.service.js';

import {
  applicantInformationSchema
} from '../validators/applicant-information.validator.js';

const getSchoolId = (req: Request) => {
  const id = req.tenant?.schoolId;
  if (!id) throw new AppError('Tenant context required.', 403);
  return id;
};

export const getApplicantInformationController = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = req.params.applicationId;
    if (!applicationId) throw new AppError('Application ID required.', 400);

    const data = await getApplicantInformation(
      getSchoolId(req),
      applicationId
    );

    res.status(200).json({ success: true, data });
  }
);

export const saveApplicantInformationController = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = req.params.applicationId;
    if (!applicationId) throw new AppError('Application ID required.', 400);

    const input = applicantInformationSchema.safeParse(req.body);
    if (!input.success) {
      throw new AppError('Invalid applicant information.', 400);
    }

    const data = await saveApplicantInformation(
      getSchoolId(req),
      applicationId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Applicant information saved.',
      data
    });
  }
);
