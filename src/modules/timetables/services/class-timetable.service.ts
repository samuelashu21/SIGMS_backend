
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';
import { validateSubjectSchedule } from './subject-scheduling.service.js';

type CreateClassTimetableInput = {
  configurationId: string;
  academicYearId: string;
  sectionId: string;
  name: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  entries: {
    periodId: string;
    day:
      | 'MONDAY'
      | 'TUESDAY'
      | 'WEDNESDAY'
      | 'THURSDAY'
      | 'FRIDAY'
      | 'SATURDAY'
      | 'SUNDAY';
    subjectId: string;
    teacherProfileId: string;
    roomLabel?: string;
    notes?: string;
  }[];
};

export const createClassTimetable = async (
  schoolId: string,
  createdById: string,
  input: CreateClassTimetableInput
) => {
  return prisma.$transaction(async (tx) => {
    const [configuration, academicYear, section] = await Promise.all([
      tx.schoolTimetableConfiguration.findFirst({
        where: {
          id: input.configurationId,
          schoolId,
          academicYearId: input.academicYearId,
          isActive: true
        },
        include: { periods: true }
      }),
      tx.academicYear.findFirst({
        where: {
          id: input.academicYearId,
          schoolId
        }
      }),
      tx.section.findFirst({
        where: {
          id: input.sectionId,
          schoolId,
          academicYearId: input.academicYearId
        }
      })
    ]);

    if (!configuration) {
      throw new AppError(
        'Active timetable configuration not found for this academic year.',
        404
      );
    }

    if (!academicYear || !section) {
      throw new AppError(
        'Academic year or section not found.',
        404
      );
    }

    const configuredPeriodIds = new Set(
      configuration.periods.map((period) => period.id)
    );

    for (const entry of input.entries) {
      if (!configuredPeriodIds.has(entry.periodId)) {
        throw new AppError(
          'A timetable entry references a period outside its configuration.',
          400
        );
      }

      if (!configuration.teachingDays.includes(entry.day)) {
        throw new AppError(
          `${entry.day} is not configured as a teaching day.`,
          400
        );
      }

      const period = configuration.periods.find(
        (item) => item.id === entry.periodId
      );

      if (!period?.isTeachingPeriod || period.type !== 'LESSON') {
        throw new AppError(
          'Subjects can only be assigned to teaching periods.',
          400
        );
      }

      const subjectAssignment = await tx.gradeSubject.findFirst({
        where: {
          schoolId,
          gradeId: section.gradeId,
          subjectId: entry.subjectId
        }
      });

      if (!subjectAssignment) {
        throw new AppError(
          'The subject is not assigned to this section grade.',
          400
        );
      }

      const teacherAssignment =
        await tx.teacherClassAssignment.findFirst({
          where: {
            schoolId,
            teacherId: entry.teacherProfileId,
            sectionId: input.sectionId,
            academicYearId: input.academicYearId,
            isActive: true
          }
        });

      if (!teacherAssignment) {
        throw new AppError(
          'The teacher is not assigned to this section for the academic year.',
          400
        );
      }

      const teacherSubjectAssignment =
        await tx.teacherSubjectAssignment.findFirst({
          where: {
            schoolId,
            teacherId: entry.teacherProfileId,
            subjectId: entry.subjectId,
            isActive: true
          }
        });

      if (!teacherSubjectAssignment) {
        throw new AppError(
          'The teacher is not assigned to teach this subject.',
          400
        );
      }
    }

    // Validate subject scheduling rules before creating the timetable.
    await validateSubjectSchedule(
      schoolId,
      input.academicYearId,
      section.gradeId,
      input.entries,
      configuration.periods
    );

    const nextVersion = await tx.timetable.aggregate({
      where: {
        schoolId,
        sectionId: input.sectionId,
        academicYearId: input.academicYearId
      },
      _max: { version: true }
    });

    const timetable = await tx.timetable.create({
      data: {
        schoolId,
        configurationId: input.configurationId,
        academicYearId: input.academicYearId,
        sectionId: input.sectionId,
        name: input.name,
        version: (nextVersion._max.version ?? 0) + 1,
        effectiveFrom: input.effectiveFrom
          ? new Date(`${input.effectiveFrom}T00:00:00.000Z`)
          : undefined,
        effectiveUntil: input.effectiveUntil
          ? new Date(`${input.effectiveUntil}T00:00:00.000Z`)
          : undefined,
        createdById,
        entries: {
          create: input.entries.map((entry) => ({
            schoolId,
            configurationId: input.configurationId,
            periodId: entry.periodId,
            day: entry.day,
            subjectId: entry.subjectId,
            teacherProfileId: entry.teacherProfileId,
            roomLabel: entry.roomLabel,
            notes: entry.notes
          }))
        }
      },
      include: {
        section: true,
        academicYear: true,
        configuration: {
          include: {
            periods: true
          }
        },
        entries: {
          include: {
            period: true,
            subject: true,
            teacherProfile: true
          }
        }
      }
    });

    return timetable;
  });
};

export const getClassTimetable = async (
  schoolId: string,
  timetableId: string
) => {
  const timetable = await prisma.timetable.findFirst({
    where: {
      id: timetableId,
      schoolId
    },
    include: {
      section: true,
      academicYear: true,
      configuration: {
        include: {
          periods: {
            orderBy: { periodNumber: 'asc' }
          }
        }
      },
      entries: {
        include: {
          period: true,
          subject: true,
          teacherProfile: true
        },
        orderBy: [
          { day: 'asc' },
          { period: { periodNumber: 'asc' } }
        ]
      }
    }
  });

  if (!timetable) {
    throw new AppError('Class timetable not found.', 404);
  }

  return timetable;
};

type ClassTimetableFilters = {
  academicYearId?: string;
  sectionId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  page: number;
  limit: number;
};

export const listClassTimetables = async (
  schoolId: string,
  filters: ClassTimetableFilters
) => {
  const where = {
    schoolId,
    ...(filters.academicYearId
      ? { academicYearId: filters.academicYearId }
      : {}),
    ...(filters.sectionId ? { sectionId: filters.sectionId } : {}),
    ...(filters.status ? { status: filters.status } : {})
  };

  const [items, total] = await prisma.$transaction([
    prisma.timetable.findMany({
      where,
      include: {
        section: true,
        academicYear: true,
        entries: {
          include: {
            period: true,
            subject: true,
            teacherProfile: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { version: 'desc' }
      ],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.timetable.count({ where })
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
