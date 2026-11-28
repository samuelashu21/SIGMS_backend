
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAcademicCalendarEventSchema,
  updateAcademicCalendarEventSchema,
  academicCalendarEventQuerySchema
} from '../validators/academic-calendar-event.validator.js';

import {
  createAcademicCalendarEvent,
  listAcademicCalendarEvents,
  getAcademicCalendarEvent,
  updateAcademicCalendarEvent
} from '../services/academic-calendar-event.service.js';

// ============================================
// CREATE ACADEMIC CALENDAR EVENT
// ============================================

export const createAcademicCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const createdById = req.auth?.sub;

    if (!schoolId || !createdById) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    const parsed = createAcademicCalendarEventSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid academic calendar event.',
        400
      );
    }

    const data = await createAcademicCalendarEvent(
      schoolId,
      createdById,
      parsed.data
    );

    res.status(201).json({
      success: true,
      message: 'Academic calendar event created.',
      data
    });
  }
);

// ============================================
// LIST ACADEMIC CALENDAR EVENTS
// ============================================

export const listAcademicCalendarEventsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    const parsed = academicCalendarEventQuerySchema.safeParse(
      req.query
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid academic calendar filters.',
        400
      );
    }

    const data = await listAcademicCalendarEvents(
      schoolId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// GET ACADEMIC CALENDAR EVENT BY ID
// ============================================

export const getAcademicCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const eventId = req.params.eventId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    // Validate event ID and narrow its type
    if (
      typeof eventId !== 'string' ||
      !eventId.trim()
    ) {
      throw new AppError(
        'Valid academic calendar event ID is required.',
        400
      );
    }

    const data = await getAcademicCalendarEvent(
      schoolId,
      eventId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

// ============================================
// UPDATE ACADEMIC CALENDAR EVENT
// ============================================

export const updateAcademicCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const eventId = req.params.eventId;

    if (!schoolId) {
      throw new AppError(
        'School context required.',
        400
      );
    }

    // Validate event ID and narrow its type
    if (
      typeof eventId !== 'string' ||
      !eventId.trim()
    ) {
      throw new AppError(
        'Valid academic calendar event ID is required.',
        400
      );
    }

    const parsed = updateAcademicCalendarEventSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      throw new AppError(
        'Invalid academic calendar event update.',
        400
      );
    }

    const data = await updateAcademicCalendarEvent(
      schoolId,
      eventId,
      parsed.data
    );

    res.status(200).json({
      success: true,
      message: 'Academic calendar event updated.',
      data
    });
  }
);
