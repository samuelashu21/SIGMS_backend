
import {
  AcademicCalendarEventType,
  Prisma
} from '../../../generated/prisma/client.js';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

// ============================================
// TYPES
// ============================================

type CreateEventInput = {
  academicYearId: string;
  title: string;
  description?: string;
  eventType: AcademicCalendarEventType;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  location?: string;
};

type EventFilters = {
  academicYearId?: string;
  eventType?: AcademicCalendarEventType;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
};

type UpdateEventInput = {
  title?: string;
  description?: string | null;
  eventType?: AcademicCalendarEventType;
  startDate?: string;
  endDate?: string;
  isAllDay?: boolean;
  location?: string | null;
};

// ============================================
// DATE HELPERS
// ============================================

const toDate = (value: string): Date => {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new AppError('Invalid event date.', 400);
  }

  return date;
};

const validateEventDates = (
  startDate: Date,
  endDate: Date,
  year: {
    startDate: Date;
    endDate: Date;
  }
): void => {
  if (
    startDate > endDate ||
    startDate < year.startDate ||
    endDate > year.endDate
  ) {
    throw new AppError(
      'Event dates must be valid and fall within the academic year.',
      400
    );
  }
};

// ============================================
// CREATE ACADEMIC CALENDAR EVENT
// ============================================

export const createAcademicCalendarEvent = async (
  schoolId: string,
  createdById: string,
  input: CreateEventInput
) => {
  return prisma.$transaction(async (tx) => {
    const academicYear = await tx.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      }
    });

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }

    const startDate = toDate(input.startDate);
    const endDate = toDate(input.endDate);

    validateEventDates(
      startDate,
      endDate,
      academicYear
    );

    return tx.academicCalendarEvent.create({
      data: {
        schoolId,
        academicYearId: input.academicYearId,
        title: input.title,
        description: input.description,
        eventType: input.eventType,
        startDate,
        endDate,
        isAllDay: input.isAllDay,
        location: input.location,
        createdById
      },
      include: {
        academicYear: true
      }
    });
  });
};

// ============================================
// LIST ACADEMIC CALENDAR EVENTS
// ============================================

export const listAcademicCalendarEvents = async (
  schoolId: string,
  filters: EventFilters
) => {
  const where: Prisma.AcademicCalendarEventWhereInput = {
    schoolId,

    ...(filters.academicYearId
      ? {
          academicYearId: filters.academicYearId
        }
      : {}),

    ...(filters.eventType
      ? {
          eventType: filters.eventType
        }
      : {}),

    ...(filters.fromDate || filters.toDate
      ? {
          ...(filters.toDate
            ? {
                startDate: {
                  lte: toDate(filters.toDate)
                }
              }
            : {}),

          ...(filters.fromDate
            ? {
                endDate: {
                  gte: toDate(filters.fromDate)
                }
              }
            : {})
        }
      : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.academicCalendarEvent.findMany({
      where,
      include: {
        academicYear: true
      },
      orderBy: {
        startDate: 'asc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),

    prisma.academicCalendarEvent.count({
      where
    })
  ]);

  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(
        total / filters.limit
      )
    }
  };
};

// ============================================
// GET ACADEMIC CALENDAR EVENT
// ============================================

export const getAcademicCalendarEvent = async (
  schoolId: string,
  eventId: string
) => {
  const event = await prisma.academicCalendarEvent.findFirst({
    where: {
      id: eventId,
      schoolId
    },
    include: {
      academicYear: true
    }
  });

  if (!event) {
    throw new AppError(
      'Academic calendar event not found.',
      404
    );
  }

  return event;
};

// ============================================
// UPDATE ACADEMIC CALENDAR EVENT
// ============================================

export const updateAcademicCalendarEvent = async (
  schoolId: string,
  eventId: string,
  input: UpdateEventInput
) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.academicCalendarEvent.findFirst({
      where: {
        id: eventId,
        schoolId
      },
      include: {
        academicYear: true
      }
    });

    if (!existing) {
      throw new AppError(
        'Academic calendar event not found.',
        404
      );
    }

    const startDate = input.startDate !== undefined
      ? toDate(input.startDate)
      : existing.startDate;

    const endDate = input.endDate !== undefined
      ? toDate(input.endDate)
      : existing.endDate;

    validateEventDates(
      startDate,
      endDate,
      existing.academicYear
    );

    return tx.academicCalendarEvent.update({
      where: {
        id: eventId
      },

      data: {
        ...(input.title !== undefined
          ? { title: input.title }
          : {}),

        ...(input.description !== undefined
          ? { description: input.description }
          : {}),

        ...(input.eventType !== undefined
          ? { eventType: input.eventType }
          : {}),

        ...(input.startDate !== undefined
          ? { startDate }
          : {}),

        ...(input.endDate !== undefined
          ? { endDate }
          : {}),

        ...(input.isAllDay !== undefined
          ? { isAllDay: input.isAllDay }
          : {}),

        ...(input.location !== undefined
          ? { location: input.location }
          : {})
      },

      include: {
        academicYear: true
      }
    });
  });
};
