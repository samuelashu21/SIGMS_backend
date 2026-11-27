
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  generateTranscriptSchema,
  transcriptQuerySchema
} from '../validators/transcript.validator.js';

import {
  generateAcademicTranscript,
  getAcademicTranscript,
  getAcademicTranscripts
} from '../services/transcript.service.js';

export const generateTranscriptController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError(
        'Authentication and school context required.',
        401
      );
    }

    const parsed = generateTranscriptSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid transcript request.', 400);
    }

    const data = await generateAcademicTranscript(
      schoolId,
      createdById,
      parsed.data.studentId
    );

    res.status(201).json({
      success: true,
      message: 'Academic transcript generated.',
      data
    });
  }
);

export const getTranscriptController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    // Normalize Express route parameter
    const transcriptId = req.params.transcriptId;

    if (
      !schoolId ||
      typeof transcriptId !== 'string' ||
      !transcriptId.trim()
    ) {
      throw new AppError(
        'School and valid transcript ID are required.',
        400
      );
    }

    const data = await getAcademicTranscript(
      schoolId,
      transcriptId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const getTranscriptsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    const parsed = transcriptQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(
        'Invalid transcript filters.',
        400
      );
    }

    const data = await getAcademicTranscripts(
      schoolId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);
