
import type { Request, Response } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAssignment,
  getAssignmentById,
  getAssignments,
  updateAssignment,
  deleteDraftAssignment
} from '../services/assignment.service.js';

import {
  createAssignmentSchema
} from '../validators/assignment.validator.js';

// Normalize Express route parameters to a single string.
const getRouteParam = (
  value: string | string[] | undefined
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const assignmentFiltersSchema = z.object({
  academicYearId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
}).refine(
  (data) =>
    !data.startDate ||
    !data.endDate ||
    data.startDate <= data.endDate,
  {
    path: ['endDate'],
    message: 'Start date must not exceed end date.'
  }
);

const updateAssignmentSchema = z.object({
  dueDate: z.iso.date().optional(),
  dueTime: z.string().regex(
    /^([01]\d|2[0-3]):[0-5]\d$/
  ).nullable().optional(),
  allowLateSubmission: z.boolean().optional(),
  latePenaltyPercent: z.coerce.number()
    .min(0)
    .max(100)
    .nullable()
    .optional(),
  attemptsAllowed: z.coerce.number().int().min(1).max(20).optional(),
  attachmentRequired: z.boolean().optional(),
  submissionInstructions: z.string().trim().max(2000).nullable().optional()
});

export const createAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError('Assignment creation context required.', 400);
    }

    const input = createAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid assignment information.', 400);
    }

    const data = await createAssignment(
      schoolId,
      createdById,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      data
    });
  }
);

export const getAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const assignmentId = getRouteParam(req.params.assignmentId);

    if (!schoolId || !assignmentId) {
      throw new AppError('Assignment context required.', 400);
    }

    const data = await getAssignmentById(
      schoolId,
      assignmentId
    );

    res.status(200).json({ success: true, data });
  }
);

export const getAssignmentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 403);
    }

    const filters = assignmentFiltersSchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid assignment filters.', 400);
    }

    const result = await getAssignments(
      schoolId,
      filters.data
    );

    res.status(200).json({
      success: true,
      ...result
    });
  }
);

export const updateAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const assignmentId = getRouteParam(req.params.assignmentId);

    if (!schoolId || !assignmentId) {
      throw new AppError('Assignment context required.', 400);
    }

    const input = updateAssignmentSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid assignment update.', 400);
    }

    const data = await updateAssignment(
      schoolId,
      assignmentId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully.',
      data
    });
  }
);

export const deleteDraftAssignmentController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const assignmentId = getRouteParam(req.params.assignmentId);

    if (!schoolId || !assignmentId) {
      throw new AppError('Assignment context required.', 400);
    }

    await deleteDraftAssignment(schoolId, assignmentId);

    res.status(200).json({
      success: true,
      message: 'Draft assignment deleted.'
    });
  }
);
