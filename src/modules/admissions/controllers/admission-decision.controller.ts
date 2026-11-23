import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  approveAdmissionApplication,
  rejectAdmissionApplication
} from '../services/admission-decision.service.js';

import {
  approveAdmissionSchema,
  rejectAdmissionSchema
} from '../validators/admission-decision.validator.js';

const getContext = (req: Request) => {
  const schoolId = req.tenant?.schoolId;
  const userId = req.auth?.sub;

  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new AppError('Authenticated school context required.', 403);
  }

  if (typeof userId !== 'string' || !userId.trim()) {
    throw new AppError('Authenticated school context required.', 403);
  }

  const applicationId = req.params.applicationId;

  if (
    typeof applicationId !== 'string' ||
    !applicationId.trim()
  ) {
    throw new AppError('Application ID required.', 400);
  }

  return { schoolId, userId, applicationId };
};

export const approveAdmissionApplicationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { schoolId, userId, applicationId } = getContext(req);

    const input = approveAdmissionSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid approval information.', 400);
    }

    const data = await approveAdmissionApplication(
      schoolId,
      applicationId,
      userId,
      input.data.decisionReason
    );

    res.status(200).json({
      success: true,
      message: 'Admission application approved.',
      data
    });
  }
);

export const rejectAdmissionApplicationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { schoolId, userId, applicationId } = getContext(req);

    const input = rejectAdmissionSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('A rejection reason is required.', 400);
    }

    const data = await rejectAdmissionApplication(
      schoolId,
      applicationId,
      userId,
      input.data.decisionReason
    );

    res.status(200).json({
      success: true,
      message: 'Admission application rejected.',
      data
    });

    }
);