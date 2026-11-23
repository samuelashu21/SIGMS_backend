
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  registerStudentFromAdmission
} from '../services/student-registration.service.js';

import {
  studentRegistrationSchema
} from '../validators/student-registration.validator.js';

export const registerStudentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const applicationId = req.params.applicationId;

    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('Tenant context required.', 403);
    }

    if (
      typeof applicationId !== 'string' ||
      !applicationId.trim()
    ) {
      throw new AppError(
        'Admission application ID required.',
        400
      );
    }

    const input = studentRegistrationSchema.safeParse({
      applicationId
    });

    if (!input.success) {
      throw new AppError(
        'Invalid admission application ID.',
        400
      );
    }

    const data = await registerStudentFromAdmission(
      schoolId,
      input.data.applicationId
    );

    res.status(201).json({
      success: true,
      message: 'Student registered successfully.',
      data
    });
  }
);
