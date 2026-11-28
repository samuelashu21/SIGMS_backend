
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type CreateHolidayInput = {
  academicYearId: string;
  name: string;
  description?: string;
  type:
    | 'PUBLIC_HOLIDAY'
    | 'RELIGIOUS_HOLIDAY'
    | 'SCHOOL_BREAK'
    | 'EMERGENCY_CLOSURE'
    | 'OTHER';
  startDate: string;
  endDate: string;
  isRecurring: boolean;
};

const toDate = (value: string) =>
  new Date(`${value}T00:00:00.000Z`);

const validateAcademicYearRange = (
  startDate: Date,
  endDate: Date,
  academicYear: { startDate: Date; endDate: Date }
) => {
  if (
    startDate < academicYear.startDate ||
    endDate > academicYear.endDate
  ) {
    throw new AppError(
      'Holiday dates must fall within the selected academic year.',
      400
    );
  }
};

export const createSchoolHoliday = async (
  schoolId: string,
  createdById: string,
  input: CreateHolidayInput
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

    validateAcademicYearRange(
      startDate,
      endDate,
      academicYear
    );

    return tx.schoolHoliday.create({
      data: {
        schoolId,
        academicYearId: input.academicYearId,
        name: input.name,
        description: input.description,
        type: input.type,
        startDate,
        endDate,
        isRecurring: input.isRecurring,
        createdById
      },
      include: {
        academicYear: true
      }
    });
  });
};

type HolidayFilters = {
  academicYearId?: string;
  type?: CreateHolidayInput['type'];
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
};

export const listSchoolHolidays = async (
  schoolId: string,
  filters: HolidayFilters
) => {
  const where = {
    schoolId,
    isActive: true,
    ...(filters.academicYearId
      ? { academicYearId: filters.academicYearId }
      : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.fromDate || filters.toDate
      ? {
          startDate: {
            ...(filters.toDate
              ? { lte: toDate(filters.toDate) }
              : {})
          },
          endDate: {
            ...(filters.fromDate
              ? { gte: toDate(filters.fromDate) }
              : {})
          }
        }
      : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.schoolHoliday.findMany({
      where,
      include: { academicYear: true },
      orderBy: { startDate: 'asc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.schoolHoliday.count({ where })
  ]);

  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const getSchoolHoliday = async (
  schoolId: string,
  holidayId: string
) => {
  const holiday = await prisma.schoolHoliday.findFirst({
    where: {
      id: holidayId,
      schoolId
    },
    include: { academicYear: true }
  });

  if (!holiday) {
    throw new AppError('School holiday not found.', 404);
  }

  return holiday;
};

type UpdateHolidayInput = {
  name?: string;
  description?: string | null;
  type?: CreateHolidayInput['type'];
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  isActive?: boolean;
};

export const updateSchoolHoliday = async (
  schoolId: string,
  holidayId: string,
  input: UpdateHolidayInput
) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.schoolHoliday.findFirst({
      where: {
        id: holidayId,
        schoolId
      },
      include: { academicYear: true }
    });

    if (!existing) {
      throw new AppError('School holiday not found.', 404);
    }

    const startDate = input.startDate
      ? toDate(input.startDate)
      : existing.startDate;

    const endDate = input.endDate
      ? toDate(input.endDate)
      : existing.endDate;

    if (startDate > endDate) {
      throw new AppError(
        'Holiday end date cannot be before its start date.',
        400
      );
    }

    validateAcademicYearRange(
      startDate,
      endDate,
      existing.academicYear
    );

    return tx.schoolHoliday.update({
      where: { id: holidayId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.startDate !== undefined ? { startDate } : {}),
        ...(input.endDate !== undefined ? { endDate } : {}),
        ...(input.isRecurring !== undefined
          ? { isRecurring: input.isRecurring }
          : {}),
        ...(input.isActive !== undefined
          ? { isActive: input.isActive }
          : {})
      },
      include: { academicYear: true }
    });
  });
};
