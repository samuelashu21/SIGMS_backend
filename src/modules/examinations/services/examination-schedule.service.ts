
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  scheduleExaminationSchema
} from '../validators/examination-schedule.validator.js';

type ScheduleInput =
  z.infer<typeof scheduleExaminationSchema>;

const toDatabaseTime = (time: string) =>
  new Date(`1970-01-01T${time}:00.000Z`);

const overlaps = (
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number
) => firstStart < secondEnd && secondStart < firstEnd;

export const scheduleExamination = async (
  schoolId: string,
  examinationId: string,
  input: ScheduleInput
) => {
  return prisma.$transaction(async (tx) => {
    const examination = await tx.examination.findFirst({
      where: {
        id: examinationId,
        schoolId
      },
      include: {
        academicYear: true
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
        'Only draft or scheduled examinations can be scheduled.',
        409
      );
    }

    const examDate = new Date(
      `${input.examinationDate}T00:00:00.000Z`
    );

    const yearStart = new Date(examination.academicYear.startDate);
    const yearEnd = new Date(examination.academicYear.endDate);

    if (
      examDate < yearStart ||
      examDate > yearEnd
    ) {
      throw new AppError(
        'Examination date must fall within the academic year.',
        400
      );
    }

    const start = toDatabaseTime(input.startTime);
    const end = toDatabaseTime(input.endTime);

    const existingExaminations =
      await tx.examination.findMany({
        where: {
          schoolId,
          examinationDate: examDate,
          status: 'SCHEDULED',
          id: { not: examinationId }
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

    for (const existing of existingExaminations) {
      if (!existing.startTime || !existing.endTime) {
        continue;
      }

      const existingStart = new Date(
        existing.startTime
      ).getTime();

      const existingEnd = new Date(
        existing.endTime
      ).getTime();

      if (
        !overlaps(
          start.getTime(),
          end.getTime(),
          existingStart,
          existingEnd
        )
      ) {
        continue;
      }

      if (
        existing.room?.trim().toLowerCase() ===
        input.room.trim().toLowerCase()
      ) {
        throw new AppError(
          `Room conflict with examination "${existing.name}".`,
          409
        );
      }

      const sameGrade = existing.gradeId === examination.gradeId;

      const sameClass =
        sameGrade &&
        (
          existing.sectionId === null ||
          examination.sectionId === null ||
          existing.sectionId === examination.sectionId
        );

      if (sameClass) {
        throw new AppError(
          `Class scheduling conflict with examination "${existing.name}".`,
          409
        );
      }
    }

    return tx.examination.update({
      where: {
        id: examinationId
      },
      data: {
        examinationDate: examDate,
        startTime: start,
        endTime: end,
        room: input.room,
        ...(input.instructions !== undefined && {
          instructions: input.instructions
        }),
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
  });
};

export const getExaminationSchedule = async (
  schoolId: string,
  filters: {
    academicYearId?: string;
    gradeId?: string;
    sectionId?: string;
    startDate?: string;
    endDate?: string;
  }
) => {
  return prisma.examination.findMany({
    where: {
      schoolId,
      status: {
        in: ['SCHEDULED', 'ONGOING']
      },
      ...(filters.academicYearId && {
        academicYearId: filters.academicYearId
      }),
      ...(filters.gradeId && {
        gradeId: filters.gradeId
      }),
      ...(filters.sectionId && {
        sectionId: filters.sectionId
      }),
      ...(filters.startDate || filters.endDate
        ? {
            examinationDate: {
              ...(filters.startDate && {
                gte: new Date(
                  `${filters.startDate}T00:00:00.000Z`
                )
              }),
              ...(filters.endDate && {
                lte: new Date(
                  `${filters.endDate}T00:00:00.000Z`
                )
              })
            }
          }
        : {})
    },
    include: {
      grade: true,
      section: true,
      subject: true,
      academicYear: true,
      semester: true
    },
    orderBy: [
      { examinationDate: 'asc' },
      { startTime: 'asc' }
    ]
  });
};
