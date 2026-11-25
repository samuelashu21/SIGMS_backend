
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  createDailyAttendanceSchema
} from '../validators/daily-attendance.validator.js';

type CreateInput = z.infer<typeof createDailyAttendanceSchema>;

export const createDailyAttendance = async (
  schoolId: string,
  recordedById: string,
  input: CreateInput
) => {
  return prisma.$transaction(async (tx) => {
    const section = await tx.section.findFirst({
      where: {
        id: input.sectionId,
        schoolId,
        grade: { schoolId },
        academicYearId: input.academicYearId
      },
      select: { id: true }
    });

    if (!section) {
      throw new AppError(
        'Section does not belong to this school and academic year.',
        404
      );
    }

    const academicYear = await tx.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      },
      select: {
        id: true,
        startDate: true,
        endDate: true
      }
    });

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }

    const attendanceDate = new Date(
      `${input.attendanceDate}T00:00:00.000Z`
    );

    if (
      attendanceDate < academicYear.startDate ||
      attendanceDate > academicYear.endDate
    ) {
      throw new AppError(
        'Attendance date is outside the academic year.',
        400
      );
    }

    const studentIds = input.records.map((record) => record.studentId);

    if (new Set(studentIds).size !== studentIds.length) {
      throw new AppError(
        'Duplicate student IDs are not allowed.',
        400
      );
    }

    const enrollments = await tx.academicEnrollment.findMany({
      where: {
        schoolId,
        sectionId: input.sectionId,
        academicYearId: input.academicYearId,
        studentId: { in: studentIds },
        status: 'ACTIVE'
      },
      select: {
        studentId: true
      }
    });

    if (enrollments.length !== studentIds.length) {
      throw new AppError(
        'Every student must have an active enrollment in this section.',
        400
      );
    }

    const existing = await tx.classAttendance.findFirst({
      where: {
        schoolId,
        sectionId: input.sectionId,
        attendanceDate,
        session: input.session
      },
      select: { id: true }
    });

    if (existing) {
      throw new AppError(
        'Attendance has already been created for this section, date and session.',
        409
      );
    }

    const classAttendance = await tx.classAttendance.create({
      data: {
        schoolId,
        sectionId: input.sectionId,
        academicYearId: input.academicYearId,
        recordedById,
        attendanceDate,
        session: input.session,
        remarks: input.remarks,
        records: {
          create: input.records.map((record) => ({
            schoolId,
            studentId: record.studentId,
            status: record.status,
            arrivalTime: record.arrivalTime
              ? new Date(record.arrivalTime)
              : null,
            remarks: record.remarks
          }))
        }
      },
      include: {
        records: {
          include: {
            student: {
              select: {
                id: true,
                studentNumber: true,
                fullName: true
              }
            }
          }
        }
      }
    });

    return classAttendance;
  });
};

export const getDailyAttendance = async (
  schoolId: string,
  sectionId: string,
  attendanceDate: string
) => {
  const date = new Date(`${attendanceDate}T00:00:00.000Z`);

  return prisma.classAttendance.findMany({
    where: {
      schoolId,
      sectionId,
      attendanceDate: date
    },
    include: {
      records: {
        include: {
          student: {
            select: {
              id: true,
              studentNumber: true,
              fullName: true
            }
          }
        }
      },
      recordedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    orderBy: {
      session: 'asc'
    }
  });
};
