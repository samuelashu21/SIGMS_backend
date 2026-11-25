
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

const APPROVED_SESSION_WHERE = {
  classAttendance: {
    status: 'APPROVED' as const
  }
};

const calculatePercentage = (
  numerator: number,
  denominator: number
) => {
  if (denominator === 0) return 0;

  return Number(((numerator / denominator) * 100).toFixed(2));
};

export const getStudentAttendanceSummary = async (
  schoolId: string,
  studentId: string,
  academicYearId?: string
) => {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      schoolId
    },
    select: { id: true, fullName: true, studentNumber: true }
  });

  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  const records = await prisma.attendanceRecord.findMany({
    where: {
      schoolId,
      studentId,
      ...APPROVED_SESSION_WHERE,
      ...(academicYearId && {
        classAttendance: { 
          status: 'APPROVED',
          academicYearId
        }
      })
    },
    select: {
      status: true
    }
  });

  const counts = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    EXCUSED: 0,
    HALF_DAY: 0
  };

  for (const record of records) {
    counts[record.status]++;
  }

  const attended = counts.PRESENT + counts.LATE + counts.HALF_DAY;

  return {
    student,
    totalSessions: records.length,
    counts,
    attendedSessions: attended,
    attendancePercentage: calculatePercentage(
      attended,
      records.length
    )
  };
};

export const getClassAttendanceSummary = async (
  schoolId: string,
  sectionId: string,
  academicYearId: string,
  startDate?: string,
  endDate?: string
) => {
  const section = await prisma.section.findFirst({
    where: {
      id: sectionId,
      schoolId,
      academicYearId
    },
    select: {
      id: true,
      name: true,
      grade: {
        select: { name: true }
      }
    }
  });

  if (!section) {
    throw new AppError('Section not found.', 404);
  }

  const records = await prisma.attendanceRecord.findMany({
    where: {
      schoolId,
      classAttendance: {
        schoolId,
        sectionId,
        academicYearId,
        status: 'APPROVED',
        ...(startDate || endDate
          ? {
              attendanceDate: {
                ...(startDate && {
                  gte: new Date(`${startDate}T00:00:00.000Z`)
                }),
                ...(endDate && {
                  lte: new Date(`${endDate}T00:00:00.000Z`)
                })
              }
            }
          : {})
      }
    },
    select: {
      status: true
    }
  });

  const counts = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    EXCUSED: 0,
    HALF_DAY: 0
  };

  for (const record of records) {
    counts[record.status]++;
  }

  const attended = counts.PRESENT + counts.LATE + counts.HALF_DAY;

  return {
    section,
    academicYearId,
    totalRecords: records.length,
    counts,
    attendancePercentage: calculatePercentage(
      attended,
      records.length
    )
  };
};

export const getSchoolAttendanceSummary = async (
  schoolId: string,
  academicYearId: string,
  startDate?: string,
  endDate?: string
) => {
  const records = await prisma.attendanceRecord.findMany({
    where: {
      schoolId,
      classAttendance: {
        schoolId,
        academicYearId,
        status: 'APPROVED',
        ...(startDate || endDate
          ? {
              attendanceDate: {
                ...(startDate && {
                  gte: new Date(`${startDate}T00:00:00.000Z`)
                }),
                ...(endDate && {
                  lte: new Date(`${endDate}T00:00:00.000Z`)
                })
              }
            }
          : {})
      }
    },
    select: {
      status: true
    }
  });

  const counts = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    EXCUSED: 0,
    HALF_DAY: 0
  };

  for (const record of records) {
    counts[record.status]++;
  }

  const attended = counts.PRESENT + counts.LATE + counts.HALF_DAY;

  return {
    schoolId,
    academicYearId,
    totalRecords: records.length,
    counts,
    attendancePercentage: calculatePercentage(
      attended,
      records.length
    )
  };
};
