
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  assignStudentSection
} from '../services/section-assignment.service.js';

import {
  sectionAssignmentSchema
} from '../validators/section-assignment.validator.js';

export const assignStudentSectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const enrollmentId = req.params.enrollmentId;

    if (typeof schoolId !== 'string' || !schoolId.trim()) {
      throw new AppError('Tenant context required.', 403);
    }

    if (
      typeof enrollmentId !== 'string' ||
      !enrollmentId.trim()
    ) {
      throw new AppError('Enrollment ID required.', 400);
    }

    const input = sectionAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid section assignment data.', 400);
    }

    const data = await assignStudentSection(
      schoolId,
      enrollmentId,
      input.data.sectionId
    );

    res.status(200).json({
      success: true,
      message: 'Student section assigned successfully.',
      data
    });
  }
);
