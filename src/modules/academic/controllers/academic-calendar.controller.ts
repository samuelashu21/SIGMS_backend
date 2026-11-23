
import type { Request, Response } from 'express';
import { z } from 'zod';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createCalendarEvent,
  getCalendarEvents,
  getCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from '../services/academic-calendar.service.js';

import {
  createCalendarEventSchema,
  updateCalendarEventSchema
} from '../validators/academic-calendar.validator.js';

const getSchoolId = (req: Request): string => {
  const schoolId = req.tenant?.schoolId;

  if (typeof schoolId !== 'string' || !schoolId.trim()) {
    throw new AppError('Tenant context required.', 403);
  }

  return schoolId;
};

const getRouteParam = (
  req: Request,
  paramName: string,
  errorMessage: string
): string => {
  const value = req.params[paramName];

  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(errorMessage, 400);
  }

  return value;
};

const querySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  eventType: createCalendarEventSchema.shape.eventType.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isPublished: z.enum(['true', 'false']).optional()
});

export const createCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = createCalendarEventSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid calendar event data.', 400);
    }

    const data = await createCalendarEvent(
      getSchoolId(req),
      input.data
    );

    res.status(201).json({
      success: true,
      data
    });
  }
);

 
export const getCalendarEventsController = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = querySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid calendar filters.', 400);
    }

    const {
      isPublished,
      ...otherFilters
    } = filters.data;

    const data = await getCalendarEvents(getSchoolId(req), {
      ...otherFilters,
      ...(isPublished !== undefined
        ? { isPublished: isPublished === 'true' }
        : {})
    });

    res.status(200).json({
      success: true,
      data
    });
  }
);


export const getCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = getRouteParam(
      req,
      'eventId',
      'Event ID required.'
    );

    const data = await getCalendarEvent(
      getSchoolId(req),
      eventId
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const updateCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = getRouteParam(
      req,
      'eventId',
      'Event ID required.'
    );

    const input = updateCalendarEventSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid calendar event data.', 400);
    }

    const data = await updateCalendarEvent(
      getSchoolId(req),
      eventId,
      input.data
    );

    res.status(200).json({
      success: true,
      data
    });
  }
);

export const deleteCalendarEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = getRouteParam(
      req,
      'eventId',
      'Event ID required.'
    );

    const data = await deleteCalendarEvent(
      getSchoolId(req),
      eventId
    );

    res.status(200).json({
      success: true,
      message: 'Calendar event deleted.',
      data
    });
  }
);
