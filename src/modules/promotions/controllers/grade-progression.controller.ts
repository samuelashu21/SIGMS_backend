
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createGradeProgressionRuleSchema,
  updateGradeProgressionRuleSchema
} from '../validators/grade-progression.validator.js';

import {
  createGradeProgressionRule,
  getGradeProgressionRules,
  updateGradeProgressionRule
} from '../services/grade-progression.service.js';

export const createGradeProgressionRuleController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const parsed = createGradeProgressionRuleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid grade progression rule.', 400);
    }

    const data = await createGradeProgressionRule(
      schoolId,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Grade progression rule created.',
      data
    });
  }
);

export const getGradeProgressionRulesController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const academicYearId = req.query.academicYearId;

    if (
      !schoolId ||
      typeof academicYearId !== 'string'
    ) {
      throw new AppError('Academic year is required.', 400);
    }

    const data = await getGradeProgressionRules(
      schoolId,
      academicYearId
    );

    res.status(200).json({ success: true, data });
  }
);

export const updateGradeProgressionRuleController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const ruleId = req.params.ruleId;

    if (!schoolId || !ruleId) {
      throw new AppError('Required request context is missing.', 400);
    }

    const parsed = updateGradeProgressionRuleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid progression rule update.', 400);
    }

    const data = await updateGradeProgressionRule(
      schoolId,
      ruleId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      message: 'Grade progression rule updated.',
      data
    });
  }
);
