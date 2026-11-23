
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateCalendarEventInput,
  UpdateCalendarEventInput
} from '../validators/academic-calendar.validator.js';

export const createCalendarEvent = async (
  schoolId: string,
  input: CreateCalendarEventInput
) => {
  const academicYear = await prisma.academicYear.findFirst({
    where: {
      id: input.academicYearId,
      schoolId
    }
  });

  if (!academicYear) {
    throw new AppError('Academic year not found.', 404);
  }

  return prisma.academicCalendarEvent.create({
    data: {
      schoolId,
      ...input
    },
    include: {
      academicYear: true
    }
  });
};

export const getCalendarEvents = (
  schoolId: string,
  filters: {
    academicYearId?: string;
    eventType?: CreateCalendarEventInput['eventType'];
    startDate?: Date;
    endDate?: Date;
    isPublished?: boolean;
  } = {}
) => {
  return prisma.academicCalendarEvent.findMany({
    where: {
      schoolId,
      ...(filters.academicYearId && {
        academicYearId: filters.academicYearId
      }),
      ...(filters.eventType && {
        eventType: filters.eventType
      }),
      ...(filters.isPublished !== undefined && {
        isPublished: filters.isPublished
      }),
      ...(filters.startDate || filters.endDate
        ? {
            startDate: filters.endDate
              ? { lte: filters.endDate }
              : undefined,
            endDate: filters.startDate
              ? { gte: filters.startDate }
              : undefined
          }
        : {})
    },
    include: {
      academicYear: true
    },
    orderBy: { startDate: 'asc' }
  });
};

export const getCalendarEvent = async (
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

  if (!event) throw new AppError('Calendar event not found.', 404);

  return event;
};

export const updateCalendarEvent = async (
  schoolId: string,
  eventId: string,
  input: UpdateCalendarEventInput
) => {
  const existing = await getCalendarEvent(schoolId, eventId);

  const startDate = input.startDate ?? existing.startDate;
  const endDate = input.endDate ?? existing.endDate;

  if (startDate > endDate) {
    throw new AppError('End date cannot precede start date.', 400);
  }

  return prisma.academicCalendarEvent.update({
    where: { id: eventId },
    data: input,
    include: {
      academicYear: true
    }
  });
};

export const deleteCalendarEvent = async (
  schoolId: string,
  eventId: string
) => {
  await getCalendarEvent(schoolId, eventId);

  return prisma.academicCalendarEvent.delete({
    where: { id: eventId }
  });
};
