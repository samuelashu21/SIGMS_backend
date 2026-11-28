
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type PeriodInput = {
  periodNumber: number;
  label: string;
  startsAt: string;
  endsAt: string;
  type: 'LESSON' | 'BREAK' | 'LUNCH' | 'ASSEMBLY' | 'OTHER';
  isTeachingPeriod: boolean;
};

type CreateConfigurationInput = {
  academicYearId: string;
  name: string;
  description?: string;
  teachingDays: (
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY'
  )[];
  schoolStartTime: string;
  schoolEndTime: string;
  allowTeacherDoubleBooking: boolean;
  allowSectionDoubleBooking: boolean;
  periods: PeriodInput[];
};

const toDatabaseTime = (value: string): Date => {
  return new Date(`1970-01-01T${value}:00.000Z`);
};

const periodData = (period: PeriodInput) => ({
  periodNumber: period.periodNumber,
  label: period.label,
  startsAt: toDatabaseTime(period.startsAt),
  endsAt: toDatabaseTime(period.endsAt),
  type: period.type,
  isTeachingPeriod: period.isTeachingPeriod
});

export const createTimetableConfiguration = async (
  schoolId: string,
  createdById: string,
  input: CreateConfigurationInput
) => {
  return prisma.$transaction(async (tx) => {
    const academicYear = await tx.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      },
      select: { id: true }
    });

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }

    const existing = await tx.schoolTimetableConfiguration.findFirst({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        name: input.name
      }
    });

    if (existing) {
      throw new AppError(
        'A timetable configuration with this name already exists.',
        409
      );
    }

    return tx.schoolTimetableConfiguration.create({
      data: {
        schoolId,
        academicYearId: input.academicYearId,
        name: input.name,
        description: input.description,
        teachingDays: input.teachingDays,
        schoolStartTime: toDatabaseTime(input.schoolStartTime),
        schoolEndTime: toDatabaseTime(input.schoolEndTime),
        allowTeacherDoubleBooking:
          input.allowTeacherDoubleBooking,
        allowSectionDoubleBooking:
          input.allowSectionDoubleBooking,
        createdById,
        periods: {
          create: input.periods.map(periodData)
        }
      },
      include: {
        academicYear: true,
        periods: {
          orderBy: { periodNumber: 'asc' }
        }
      }
    });
  });
};

export const getTimetableConfigurations = async (
  schoolId: string,
  academicYearId?: string
) => {
  return prisma.schoolTimetableConfiguration.findMany({
    where: {
      schoolId,
      ...(academicYearId ? { academicYearId } : {})
    },
    include: {
      academicYear: true,
      periods: {
        orderBy: { periodNumber: 'asc' }
      }
    },
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' }
    ]
  });
};

export const getTimetableConfiguration = async (
  schoolId: string,
  configurationId: string
) => {
  const configuration =
    await prisma.schoolTimetableConfiguration.findFirst({
      where: {
        id: configurationId,
        schoolId
      },
      include: {
        academicYear: true,
        periods: {
          orderBy: { periodNumber: 'asc' }
        }
      }
    });

  if (!configuration) {
    throw new AppError('Timetable configuration not found.', 404);
  }

  return configuration;
};

type UpdateConfigurationInput = {
  name?: string;
  description?: string | null;
  teachingDays?: CreateConfigurationInput['teachingDays'];
  schoolStartTime?: string;
  schoolEndTime?: string;
  allowTeacherDoubleBooking?: boolean;
  allowSectionDoubleBooking?: boolean;
  isActive?: boolean;
  periods?: PeriodInput[];
};

export const updateTimetableConfiguration = async (
  schoolId: string,
  configurationId: string,
  input: UpdateConfigurationInput
) => {
  return prisma.$transaction(async (tx) => {
    const configuration =
      await tx.schoolTimetableConfiguration.findFirst({
        where: {
          id: configurationId,
          schoolId
        },
        include: {
          periods: true
        }
      });

    if (!configuration) {
      throw new AppError('Timetable configuration not found.', 404);
    }

    if (input.periods) {
      const timetableCount = await tx.timetable.count({
        where: {
          schoolId,
          configurationId
        }
      });

      if (timetableCount > 0) {
        throw new AppError(
          'Cannot replace periods after timetables have been created using this configuration.',
          409
        );
      }
    }

    const updateData = {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.teachingDays !== undefined
        ? { teachingDays: input.teachingDays }
        : {}),
      ...(input.schoolStartTime !== undefined
        ? { schoolStartTime: toDatabaseTime(input.schoolStartTime) }
        : {}),
      ...(input.schoolEndTime !== undefined
        ? { schoolEndTime: toDatabaseTime(input.schoolEndTime) }
        : {}),
      ...(input.allowTeacherDoubleBooking !== undefined
        ? {
            allowTeacherDoubleBooking:
              input.allowTeacherDoubleBooking
          }
        : {}),
      ...(input.allowSectionDoubleBooking !== undefined
        ? {
            allowSectionDoubleBooking:
              input.allowSectionDoubleBooking
          }
        : {}),
      ...(input.isActive !== undefined
        ? { isActive: input.isActive }
        : {})
    };

    if (input.periods) {
      await tx.timetablePeriod.deleteMany({
        where: { configurationId }
      });

      await tx.timetablePeriod.createMany({
        data: input.periods.map((period) => ({
          configurationId,
          ...periodData(period)
        }))
      });
    }

    return tx.schoolTimetableConfiguration.update({
      where: { id: configurationId },
      data: updateData,
      include: {
        academicYear: true,
        periods: {
          orderBy: { periodNumber: 'asc' }
        }
      }
    });
  });
};
