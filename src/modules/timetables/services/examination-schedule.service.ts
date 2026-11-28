
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type ScheduleExaminationInput = {
  examinationDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  instructions?: string;
};

const toDatabaseTime = (value: string): Date =>
  new Date(`1970-01-01T${value}:00.000Z`);

const toMinutes = (value: Date): number =>
  value.getUTCHours() * 60 + value.getUTCMinutes();

const overlaps = (
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number
): boolean =>
  firstStart < secondEnd && secondStart < firstEnd;

export const scheduleExamination = async (
  schoolId: string,
  examinationId: string,
  performedById: string,
  input: ScheduleExaminationInput
) => {
  return prisma.$transaction(async (tx) => {
    const examination = await tx.examination.findFirst({
      where: {
        id: examinationId,
        schoolId
      },
      include: {
        academicYear: true,
        section: true,
        grade: true
      }
    });

    if (!examination) {
      throw new AppError('Examination not found.', 404);
    }

    if (
      examination.status !== 'DRAFT' &&
      examination.status !== 'SCHEDULED'
    ) {
      throw new AppError(
        'Only draft or scheduled examinations can be rescheduled.',
        409
      );
    }

    // Validate examination date
    const examinationDate = new Date(
      `${input.examinationDate}T00:00:00.000Z`
    );

    if (Number.isNaN(examinationDate.getTime())) {
      throw new AppError('Invalid examination date.', 400);
    }

    const yearStart = new Date(examination.academicYear.startDate);
    const yearEnd = new Date(examination.academicYear.endDate);

    if (
      examinationDate < yearStart ||
      examinationDate > yearEnd
    ) {
      throw new AppError(
        'Examination date must fall within the academic year.',
        400
      );
    }

    // Convert examination times
    const startTime = toDatabaseTime(input.startTime);
    const endTime = toDatabaseTime(input.endTime);

    if (
      Number.isNaN(startTime.getTime()) ||
      Number.isNaN(endTime.getTime())
    ) {
      throw new AppError('Invalid examination time.', 400);
    }

    const requestedStart = toMinutes(startTime);
    const requestedEnd = toMinutes(endTime);

    // Validate time range
    if (requestedEnd <= requestedStart) {
      throw new AppError(
        'Examination end time must be later than start time.',
        400
      );
    }

    // Find possible scheduling conflicts
    const conflicts = await tx.examination.findMany({
      where: {
        schoolId,
        id: {
          not: examinationId
        },
        examinationDate,
        status: {
          not: 'CANCELLED'
        },
        OR: [
          ...(examination.sectionId
            ? [{ sectionId: examination.sectionId }]
            : [{ gradeId: examination.gradeId }]),
          ...(input.room
            ? [{ room: input.room }]
            : [])
        ]
      },
      select: {
        id: true,
        name: true,
        sectionId: true,
        gradeId: true,
        room: true,
        startTime: true,
        endTime: true
      }
    });

    // Check scheduling conflicts
    for (const conflict of conflicts) {
      // Fix: Prisma DateTime? fields can return null
      if (
        conflict.startTime === null ||
        conflict.endTime === null
      ) {
        continue;
      }

      const existingStart = toMinutes(conflict.startTime);
      const existingEnd = toMinutes(conflict.endTime);

      if (
        overlaps(
          requestedStart,
          requestedEnd,
          existingStart,
          existingEnd
        )
      ) {
        const sameSection =
          Boolean(examination.sectionId) &&
          conflict.sectionId === examination.sectionId;

        const sameGrade =
          !examination.sectionId &&
          !conflict.sectionId &&
          conflict.gradeId === examination.gradeId;

        const sameRoom =
          Boolean(input.room) &&
          conflict.room === input.room;

        if (sameSection || sameGrade || sameRoom) {
          throw new AppError(
            `Scheduling conflict with examination "${conflict.name}".`,
            409
          );
        }
      }
    }

    // Update examination schedule
    const updated = await tx.examination.update({
      where: {
        id: examinationId
      },
      data: {
        examinationDate,
        startTime,
        endTime,
        room: input.room,
        instructions: input.instructions,
        status: 'SCHEDULED'
      },
      include: {
        academicYear: true,
        semester: true,
        grade: true,
        section: true,
        subject: true
      }
    });

    return updated;
  });
};

// ============================================
// GET EXAMINATION SCHEDULE
// ============================================

type ExaminationScheduleFilters = {
  academicYearId?: string;
  gradeId?: string;
  sectionId?: string;
  examinationDate?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  limit: number;
};

export const getExaminationSchedule = async (
  schoolId: string,
  filters: ExaminationScheduleFilters
) => {
  // Build examination date filter
  const dateFilter = filters.examinationDate
    ? {
        examinationDate: new Date(
          `${filters.examinationDate}T00:00:00.000Z`
        )
      }
    : filters.fromDate || filters.toDate
      ? {
          examinationDate: {
            ...(filters.fromDate
              ? {
                  gte: new Date(
                    `${filters.fromDate}T00:00:00.000Z`
                  )
                }
              : {}),
            ...(filters.toDate
              ? {
                  lte: new Date(
                    `${filters.toDate}T00:00:00.000Z`
                  )
                }
              : {})
          }
        }
      : {};

  // Build Prisma where condition
  const where = {
    schoolId,
    status: 'SCHEDULED' as const,

    ...(filters.academicYearId
      ? {
          academicYearId: filters.academicYearId
        }
      : {}),

    ...(filters.gradeId
      ? {
          gradeId: filters.gradeId
        }
      : {}),

    ...(filters.sectionId
      ? {
          sectionId: filters.sectionId
        }
      : {}),

    ...dateFilter
  };

  // Fetch examination records and total count
  const [items, total] = await prisma.$transaction([
    prisma.examination.findMany({
      where,
      include: {
        academicYear: true,
        semester: true,
        grade: true,
        section: true,
        subject: true
      },
      orderBy: [
        {
          examinationDate: 'asc'
        },
        {
          startTime: 'asc'
        }
      ],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),

    prisma.examination.count({
      where
    })
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
