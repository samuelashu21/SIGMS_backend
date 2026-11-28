
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createSubjectSchedulingRequirementSchema,
  updateSubjectSchedulingRequirementSchema
} from '../validators/subject-scheduling.validator.js';

import {
  createSubjectSchedulingRequirement,
  listSubjectSchedulingRequirements,
  updateSubjectSchedulingRequirement
} from '../services/subject-scheduling.service.js';

// ============================================
// CREATE SUBJECT SCHEDULING REQUIREMENT
// ============================================

export const createSubjectSchedulingRequirementController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const parsed =
      createSubjectSchedulingRequirementSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        'Invalid subject scheduling requirement.',
        400
      );
    }

    const data = await createSubjectSchedulingRequirement(
      schoolId,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Subject scheduling requirement created.',
      data
    });
  });

// ============================================
// LIST SUBJECT SCHEDULING REQUIREMENTS
// ============================================

export const listSubjectSchedulingRequirementsController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const academicYearId = req.query.academicYearId;
    const gradeId = req.query.gradeId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    if (
      typeof academicYearId !== 'string' ||
      !academicYearId.trim()
    ) {
      throw new AppError(
        'Academic year ID is required.',
        400
      );
    }

    const data = await listSubjectSchedulingRequirements(
      schoolId,
      academicYearId,
      typeof gradeId === 'string' && gradeId.trim()
        ? gradeId
        : undefined
    );

    res.status(200).json({
      success: true,
      data
    });
  });

// ============================================
// UPDATE SUBJECT SCHEDULING REQUIREMENT
// ============================================

export const updateSubjectSchedulingRequirementController =
  asyncHandler(async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    const requirementId = req.params.requirementId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    // Validate and narrow route parameter type
    if (
      typeof requirementId !== 'string' ||
      !requirementId.trim()
    ) {
      throw new AppError(
        'Valid subject scheduling requirement ID is required.',
        400
      );
    }

    const parsed =
      updateSubjectSchedulingRequirementSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(
        'Invalid subject scheduling update.',
        400
      );
    }

    const data = await updateSubjectSchedulingRequirement(
      schoolId,
      requirementId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      message: 'Subject scheduling requirement updated.',
      data
    });
  });
