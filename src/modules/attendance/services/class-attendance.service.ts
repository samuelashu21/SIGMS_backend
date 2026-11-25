
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';

import {
  updateClassAttendanceSchema,
  classAttendanceQuerySchema
} from '../validators/class-attendance.validator.js';

type UpdateInput = z.infer<typeof updateClassAttendanceSchema>;
type QueryInput = z.infer<typeof classAttendanceQuerySchema>;

export const getClassAttendanceById = async (
  schoolId: string,
  attendanceId: string
) => {
  const attendance = await prisma.classAttendance.findFirst({
    where: {
      id: attendanceId,
      schoolId
    },
    include: {
      section: {
        include: {
          grade: true
        }
      },
      academicYear: true,
      recordedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      },
      approvedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      },
      records: {
        include: {
          student: {
            select: {
              id: true,
              studentNumber: true,
              fullName: true
            }
          }
        },
        orderBy: {
          student: {
            fullName: 'asc'
          }
        }
      }
    }
  });

  if (!attendance) {
    throw new AppError('Class attendance not found.', 404);
  }

  return attendance;
};

export const getClassAttendanceList = async (
  schoolId: string,
  filters: QueryInput
) => {
  const attendanceDate = filters.date
    ? new Date(`${filters.date}T00:00:00.000Z`)
    : undefined;

  return prisma.classAttendance.findMany({
    where: {
      schoolId,
      ...(attendanceDate && { attendanceDate }),
      ...(filters.academicYearId && {
        academicYearId: filters.academicYearId
      }),
      ...(filters.sectionId && {
        sectionId: filters.sectionId
      }),
      ...(filters.session && {
        session: filters.session
      }),
      ...(filters.status && {
        status: filters.status
      })
    },
    include: {
      section: {
        include: {
          grade: true
        }
      },
      academicYear: true,
      recordedBy: {
        select: {
          id: true,
          username: true
        }
      },
      _count: {
        select: {
          records: true
        }
      }
    },
    orderBy: [
      { attendanceDate: 'desc' },
      { createdAt: 'desc' }
    ]
  });
};

export const updateClassAttendance = async (
  schoolId: string,
  attendanceId: string,
  input: UpdateInput
) => {
  const attendance = await prisma.classAttendance.findFirst({
    where: {
      id: attendanceId,
      schoolId
    },
    select: {
      id: true,
      status: true
    }
  });

  if (!attendance) {
    throw new AppError('Class attendance not found.', 404);
  }

  if (attendance.status !== 'DRAFT') {
    throw new AppError(
      'Only draft attendance sessions can be updated.',
      409
    );
  }

  return prisma.classAttendance.update({
    where: {
      id: attendanceId
    },
    data: input,
    include: {
      section: true,
      records: true
    }
  });
};
