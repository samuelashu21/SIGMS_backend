
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const getStudentAttendanceReport = async (
  schoolId: string,
  studentId: string,
  startDate: string,
  endDate: string
) => {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      schoolId
    },
    select: {
      id: true,
      studentNumber: true,
      fullName: true
    }
  });

  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  const records = await prisma.attendanceRecord.findMany({
    where: {
      schoolId,
      studentId,
      classAttendance: {
        schoolId,
        status: 'APPROVED',
        attendanceDate: {
          gte: new Date(`${startDate}T00:00:00.000Z`),
          lte: new Date(`${endDate}T00:00:00.000Z`)
        }
      }
    },
    include: {
      classAttendance: {
        select: {
          attendanceDate: true,
          session: true,
          section: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      classAttendance: {
        attendanceDate: 'asc'
      }
    }
  });

  return {
    student,
    period: { startDate, endDate },
    totalSessions: records.length,
    records: records.map((record) => ({
      date: record.classAttendance.attendanceDate,
      session: record.classAttendance.session,
      section: record.classAttendance.section.name,
      status: record.status,
      remarks: record.remarks
    }))
  };
};

export const getSectionAttendanceReport = async (
  schoolId: string,
  sectionId: string,
  academicYearId: string,
  startDate: string,
  endDate: string
) => {
  const section = await prisma.section.findFirst({
    where: {
      id: sectionId,
      schoolId,
      academicYearId
    },
    include: {
      grade: true
    }
  });

  if (!section) {
    throw new AppError('Section not found.', 404);
  }

  const sessions = await prisma.classAttendance.findMany({
    where: {
      schoolId,
      sectionId,
      academicYearId,
      status: 'APPROVED',
      attendanceDate: {
        gte: new Date(`${startDate}T00:00:00.000Z`),
        lte: new Date(`${endDate}T00:00:00.000Z`)
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
    },
    orderBy: {
      attendanceDate: 'asc'
    }
  });

  return {
    section: {
      id: section.id,
      name: section.name,
      grade: section.grade.name
    },
    academicYearId,
    period: { startDate, endDate },
    sessions: sessions.map((session) => ({
      date: session.attendanceDate,
      session: session.session,
      students: session.records.map((record) => ({
        studentId: record.student.id,
        studentNumber: record.student.studentNumber,
        studentName: record.student.fullName,
        status: record.status
      }))
    }))
  };
};

export const getSchoolAttendanceReport = async (
  schoolId: string,
  academicYearId: string,
  startDate: string,
  endDate: string
) => {
  const academicYear = await prisma.academicYear.findFirst({
    where: {
      id: academicYearId,
      schoolId
    },
    select: {
      id: true,
      name: true
    }
  });

  if (!academicYear) {
    throw new AppError('Academic year not found.', 404);
  }

  const sessions = await prisma.classAttendance.findMany({
    where: {
      schoolId,
      academicYearId,
      status: 'APPROVED',
      attendanceDate: {
        gte: new Date(`${startDate}T00:00:00.000Z`),
        lte: new Date(`${endDate}T00:00:00.000Z`)
      }
    },
    include: {
      section: {
        include: {
          grade: true
        }
      },
      records: {
        select: {
          status: true
        }
      }
    },
    orderBy: {
      attendanceDate: 'asc'
    }
  });

  return {
    academicYear,
    period: { startDate, endDate },
    sessions: sessions.map((session) => ({
      date: session.attendanceDate,
      section: session.section.name,
      grade: session.section.grade.name,
      session: session.session,
      totalStudents: session.records.length,
      present: session.records.filter(
        (record) => record.status === 'PRESENT'
      ).length,
      absent: session.records.filter(
        (record) => record.status === 'ABSENT'
      ).length,
      late: session.records.filter(
        (record) => record.status === 'LATE'
      ).length,
      excused: session.records.filter(
        (record) => record.status === 'EXCUSED'
      ).length,
      halfDay: session.records.filter(
        (record) => record.status === 'HALF_DAY'
      ).length
    }))
  };
};
