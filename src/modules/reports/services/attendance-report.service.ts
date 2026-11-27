
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type AttendanceReportInput = {
  academicYearId: string;
  scope: 'STUDENT' | 'SECTION';
  studentId?: string;
  sectionId?: string;
  semesterId?: string;
  startDate: Date;
  endDate: Date;
};

export const generateAttendanceReport = async (
  schoolId: string,
  generatedById: string,
  input: AttendanceReportInput
) => {
  return prisma.$transaction(async (tx) => {
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

    if (
      input.startDate < academicYear.startDate ||
      input.endDate > academicYear.endDate
    ) {
      throw new AppError(
        'Report dates must be within the academic year.',
        400
      );
    }

    let semester: { id: string; startDate: Date; endDate: Date } | null = null;

    if (input.semesterId) {
      semester = await tx.semester.findFirst({
        where: {
          id: input.semesterId,
          schoolId,
          academicYearId: input.academicYearId
        },
        select: {
          id: true,
          startDate: true,
          endDate: true
        }
      });

      if (!semester) {
        throw new AppError('Semester not found.', 404);
      }

      if (
        input.startDate < semester.startDate ||
        input.endDate > semester.endDate
      ) {
        throw new AppError(
          'Report dates must be within the selected semester.',
          400
        );
      }
    }

    if (input.scope === 'STUDENT') {
      const student = await tx.student.findFirst({
        where: {
          id: input.studentId,
          schoolId
        },
        select: { id: true }
      });

      if (!student) {
        throw new AppError('Student not found.', 404);
      }

      const enrollment = await tx.academicEnrollment.findFirst({
        where: {
          schoolId,
          studentId: input.studentId,
          academicYearId: input.academicYearId
        },
        select: { id: true }
      });

      if (!enrollment) {
        throw new AppError(
          'Student is not enrolled in this academic year.',
          404
        );
      }
    }

    if (input.scope === 'SECTION') {
      const section = await tx.section.findFirst({
        where: {
          id: input.sectionId,
          schoolId,
          academicYearId: input.academicYearId
        },
        select: { id: true }
      });

      if (!section) {
        throw new AppError('Section not found.', 404);
      }
    }

    const attendanceRecords = await tx.attendanceRecord.findMany({
      where: {
        schoolId,
        ...(input.studentId && { studentId: input.studentId }),
        classAttendance: {
          schoolId,
          academicYearId: input.academicYearId,
          status: 'APPROVED',
          attendanceDate: {
            gte: input.startDate,
            lte: input.endDate
          },
          ...(input.sectionId && { sectionId: input.sectionId })
        }
      },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            fullName: true
          }
        },
        classAttendance: {
          select: {
            attendanceDate: true,
            session: true,
            sectionId: true
          }
        }
      },
      orderBy: {
        classAttendance: {
          attendanceDate: 'asc'
        }
      }
    });

    const count = (status: string) =>
      attendanceRecords.filter(
        (record) => record.status === status
      ).length;

    const presentCount = count('PRESENT');
    const absentCount = count('ABSENT');
    const lateCount = count('LATE');
    const excusedCount = count('EXCUSED');
    const halfDayCount = count('HALF_DAY');

    const totalSessions = attendanceRecords.length;

    const attendancePercentage = totalSessions
      ? Number(
          (
            ((presentCount + lateCount + halfDayCount) /
              totalSessions) * 100
          ).toFixed(2)
        )
      : null;

    const studentSummaries = input.scope === 'SECTION'
      ? Array.from(
          attendanceRecords.reduce((map, record) => {
            const existing = map.get(record.studentId) ?? {
              studentId: record.studentId,
              studentNumber: record.student.studentNumber,
              studentName: record.student.fullName,
              totalSessions: 0,
              present: 0,
              absent: 0,
              late: 0,
              excused: 0,
              halfDay: 0
            };

            existing.totalSessions += 1;
            existing[record.status === 'PRESENT' ? 'present' :
              record.status === 'ABSENT' ? 'absent' :
              record.status === 'LATE' ? 'late' :
              record.status === 'EXCUSED' ? 'excused' : 'halfDay'] += 1;

            map.set(record.studentId, existing);
            return map;
          }, new Map())
            .values()
        )
      : [];

    const reportNumber =
      `ATT-${Date.now()}-${input.scope}`;

    return tx.attendanceReport.create({
      data: {
        schoolId,
        academicYearId: input.academicYearId,
        studentId: input.studentId ?? null,
        sectionId: input.sectionId ?? null,
        semesterId: input.semesterId ?? null,
        reportNumber,
        scope: input.scope,
        startDate: input.startDate,
        endDate: input.endDate,
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        halfDayCount,
        attendancePercentage,
        reportDetails: {
          studentSummaries,
          records: input.scope === 'STUDENT'
            ? attendanceRecords.map((record) => ({
                date: record.classAttendance.attendanceDate,
                session: record.classAttendance.session,
                status: record.status,
                arrivalTime: record.arrivalTime,
                remarks: record.remarks
              }))
            : undefined
        },
        generatedById
      }
    });
  });
};

export const getAttendanceReports = async (
  schoolId: string,
  filters: {
    studentId?: string;
    sectionId?: string;
    academicYearId?: string;
    semesterId?: string;
    page: number;
    limit: number;
  }
) => {
  const where = {
    schoolId,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.sectionId && { sectionId: filters.sectionId }),
    ...(filters.academicYearId && {
      academicYearId: filters.academicYearId
    }),
    ...(filters.semesterId && { semesterId: filters.semesterId })
  };

  const [records, total] = await prisma.$transaction([
    prisma.attendanceReport.findMany({
      where,
      include: {
        student: true,
        section: true,
        academicYear: true,
        semester: true,
        generatedBy: {
          select: { id: true, username: true }
        }
      },
      orderBy: { generatedAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.attendanceReport.count({ where })
  ]);

  return {
    records,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};
