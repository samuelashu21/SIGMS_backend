
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const getStudentAttendanceHistory = async (
  schoolId: string,
  studentId: string,
  filters: {
    academicYearId?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }
) => {
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId },
    select: {
      id: true,
      fullName: true,
      studentNumber: true
    }
  });

  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  const where = {
    schoolId,
    studentId,
    classAttendance: {
      schoolId,
      ...(filters.academicYearId && {
        academicYearId: filters.academicYearId
      }),
      ...(filters.startDate || filters.endDate
        ? {
            attendanceDate: {
              ...(filters.startDate && {
                gte: new Date(`${filters.startDate}T00:00:00.000Z`)
              }),
              ...(filters.endDate && {
                lte: new Date(`${filters.endDate}T00:00:00.000Z`)
              })
            }
          }
        : {})
    }
  };

  const [records, total] = await prisma.$transaction([
    prisma.attendanceRecord.findMany({
      where,
      include: {
        classAttendance: {
          select: {
            attendanceDate: true,
            session: true,
            status: true,
            section: {
              select: {
                id: true,
                name: true
              }
            },
            recordedBy: {
              select: {
                id: true,
                username: true
              }
            },
            approvedBy: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        corrections: {
          where: { schoolId },
          include: {
            requestedBy: {
              select: { id: true, username: true }
            },
            reviewedBy: {
              select: { id: true, username: true }
            }
          },
          orderBy: { requestedAt: 'desc' }
        }
      },
      orderBy: {
        classAttendance: {
          attendanceDate: 'desc'
        }
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.attendanceRecord.count({ where })
  ]);

  return {
    student,
    records,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const getClassAttendanceHistory = async (
  schoolId: string,
  sectionId: string,
  filters: {
    academicYearId?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }
) => {
  const section = await prisma.section.findFirst({
    where: {
      id: sectionId,
      schoolId,
      ...(filters.academicYearId && {
        academicYearId: filters.academicYearId
      })
    },
    select: {
      id: true,
      name: true,
      grade: { select: { name: true } }
    }
  });

  if (!section) {
    throw new AppError('Section not found.', 404);
  }

  const where = {
    schoolId,
    sectionId,
    ...(filters.academicYearId && {
      academicYearId: filters.academicYearId
    }),
    ...(filters.startDate || filters.endDate
      ? {
          attendanceDate: {
            ...(filters.startDate && {
              gte: new Date(`${filters.startDate}T00:00:00.000Z`)
            }),
            ...(filters.endDate && {
              lte: new Date(`${filters.endDate}T00:00:00.000Z`)
            })
          }
        }
      : {})
  };

  const [sessions, total] = await prisma.$transaction([
    prisma.classAttendance.findMany({
      where,
      include: {
        recordedBy: {
          select: { id: true, username: true }
        },
        approvedBy: {
          select: { id: true, username: true }
        },
        records: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentNumber: true
              }
            }
          }
        }
      },
      orderBy: { attendanceDate: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.classAttendance.count({ where })
  ]);

  return {
    section,
    sessions,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const getAttendanceCorrectionHistory = async (
  schoolId: string,
  attendanceRecordId: string
) => {
  const record = await prisma.attendanceRecord.findFirst({
    where: {
      id: attendanceRecordId,
      schoolId
    },
    select: { id: true }
  });

  if (!record) {
    throw new AppError('Attendance record not found.', 404);
  }

  return prisma.attendanceCorrection.findMany({
    where: {
      schoolId,
      attendanceRecordId
    },
    include: {
      requestedBy: {
        select: { id: true, username: true }
      },
      reviewedBy: {
        select: { id: true, username: true }
      }
    },
    orderBy: { requestedAt: 'desc' }
  });
};
