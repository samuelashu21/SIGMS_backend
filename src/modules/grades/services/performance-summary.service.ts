
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type SummaryInput = {
  studentId: string;
  academicYearId: string;
  summaryType: 'SEMESTER' | 'ANNUAL';
  semesterId?: string;
};

export const generateAcademicPerformanceSummary = async (
  schoolId: string,
  input: SummaryInput
) => {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      },
      select: { id: true }
    });

    if (!enrollment) {
      throw new AppError('Student enrollment not found.', 404);
    }

    // Retrieve active academic grading configuration
    const gradingConfiguration =
      await tx.academicGradingConfiguration.findFirst({
        where: {
          schoolId,
          academicYearId: input.academicYearId,
          isActive: true
        },
        select: {
          passingPercentage: true
        }
      });

    if (!gradingConfiguration) {
      throw new AppError(
        'Academic grading configuration not found.',
        409
      );
    }

    let semesterId: string | null = null;
    let periodKey = 'ANNUAL';

    if (input.summaryType === 'SEMESTER') {
      if (!input.semesterId) {
        throw new AppError('Semester is required.', 400);
      }

      const semester = await tx.semester.findFirst({
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

      semesterId = semester.id;
      periodKey = `SEMESTER:${semester.id}`;
    }

    const [subjectResults, semesterAverage, annualAverage] =
      await Promise.all([
        tx.subjectGradeResult.findMany({
          where: {
            schoolId,
            studentId: input.studentId,
            academicYearId: input.academicYearId,
            ...(semesterId && { semesterId })
          },
          include: {
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            subject: { name: 'asc' }
          }
        }),

        semesterId
          ? tx.semesterAcademicAverage.findFirst({
              where: {
                schoolId,
                studentId: input.studentId,
                academicYearId: input.academicYearId,
                semesterId
              }
            })
          : Promise.resolve(null),

        !semesterId
          ? tx.annualAcademicAverage.findFirst({
              where: {
                schoolId,
                studentId: input.studentId,
                academicYearId: input.academicYearId
              }
            })
          : Promise.resolve(null)
      ]);

    if (subjectResults.length === 0) {
      throw new AppError(
        'No subject grade results are available.',
        409
      );
    }

    if (semesterId && !semesterAverage) {
      throw new AppError(
        'Calculate the semester average before generating its summary.',
        409
      );
    }

    if (!semesterId && !annualAverage) {
      throw new AppError(
        'Calculate the annual average before generating its summary.',
        409
      );
    }

    const percentages = subjectResults.map(
      (result) => Number(result.finalPercentage)
    );

    const overallPercentage = semesterId
      ? Number(semesterAverage!.averagePercentage)
      : Number(annualAverage!.averagePercentage);

    const overallGradePoint = semesterId
      ? semesterAverage!.averageGradePoint === null
        ? null
        : Number(semesterAverage!.averageGradePoint)
      : annualAverage!.averageGradePoint === null
        ? null
        : Number(annualAverage!.averageGradePoint);

    // Calculate passed and failed subjects using configured passing percentage
    const passingPercentage = Number(
      gradingConfiguration.passingPercentage
    );

    const passedSubjects = subjectResults.filter(
      (result) =>
        Number(result.finalPercentage) >= passingPercentage
    ).length;

    const failedSubjects = subjectResults.length - passedSubjects;

    // Attendance calculations
    const attendanceWhere = {
      schoolId,
      studentId: input.studentId,
      classAttendance: {
        schoolId,
        academicYearId: input.academicYearId,
        status: 'APPROVED' as const,
        ...(semesterId && {
          attendanceDate: {
            gte: (
              await tx.semester.findFirstOrThrow({
                where: { id: semesterId, schoolId },
                select: { startDate: true }
              })
            ).startDate,
            lte: (
              await tx.semester.findFirstOrThrow({
                where: { id: semesterId, schoolId },
                select: { endDate: true }
              })
            ).endDate
          }
        })
      }
    };

    const attendanceRecords = await tx.attendanceRecord.findMany({
      where: attendanceWhere,
      select: { status: true }
    });

    const attended = attendanceRecords.filter((record) =>
      ['PRESENT', 'LATE', 'HALF_DAY'].includes(record.status)
    ).length;

    const attendancePercentage = attendanceRecords.length > 0
      ? Number(
          (
            (attended / attendanceRecords.length) *
            100
          ).toFixed(2)
        )
      : null;

    // Performance details
    const performanceDetails = {
      subjects: subjectResults.map((result) => ({
        subjectId: result.subjectId,
        subjectName: result.subject.name,
        percentage: Number(result.finalPercentage),
        letterGrade: result.letterGrade,
        gradePoint:
          result.gradePoint === null
            ? null
            : Number(result.gradePoint)
      })),

      attendance: {
        totalSessions: attendanceRecords.length,
        attendedSessions: attended,
        attendancePercentage
      }
    };

    // Create or update academic performance summary
    return tx.academicPerformanceSummary.upsert({
      where: {
        schoolId_studentId_academicYearId_periodKey: {
          schoolId,
          studentId: input.studentId,
          academicYearId: input.academicYearId,
          periodKey
        }
      },

      create: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        semesterId,
        periodKey,
        summaryType: input.summaryType,
        overallPercentage,
        overallGradePoint,
        totalSubjects: subjectResults.length,
        passedSubjects,
        failedSubjects,
        attendancePercentage,
        highestSubjectPercentage: Math.max(...percentages),
        lowestSubjectPercentage: Math.min(...percentages),
        performanceDetails
      },

      update: {
        overallPercentage,
        overallGradePoint,
        totalSubjects: subjectResults.length,
        passedSubjects,
        failedSubjects,
        attendancePercentage,
        highestSubjectPercentage: Math.max(...percentages),
        lowestSubjectPercentage: Math.min(...percentages),
        performanceDetails,
        generatedAt: new Date()
      }
    });
  });
};

export const getAcademicPerformanceSummaries = async (
  schoolId: string,
  filters: {
    studentId?: string;
    academicYearId?: string;
    semesterId?: string;
    summaryType?: 'SEMESTER' | 'ANNUAL';
    page: number;
    limit: number;
  }
) => {
  const where = {
    schoolId,
    ...(filters.studentId && {
      studentId: filters.studentId
    }),
    ...(filters.academicYearId && {
      academicYearId: filters.academicYearId
    }),
    ...(filters.semesterId && {
      semesterId: filters.semesterId
    }),
    ...(filters.summaryType && {
      summaryType: filters.summaryType
    })
  };

  const [records, total] = await prisma.$transaction([
    prisma.academicPerformanceSummary.findMany({
      where,
      include: {
        student: true,
        academicYear: true,
        semester: true
      },
      orderBy: {
        generatedAt: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),

    prisma.academicPerformanceSummary.count({ where })
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

export const getStudentAcademicPerformanceOverview = async (
  schoolId: string,
  studentId: string,
  academicYearId: string
) => {
  const [
    annualAverage,
    semesterAverages,
    subjectResults,
    summaries
  ] = await prisma.$transaction([
    prisma.annualAcademicAverage.findFirst({
      where: {
        schoolId,
        studentId,
        academicYearId
      }
    }),

    prisma.semesterAcademicAverage.findMany({
      where: {
        schoolId,
        studentId,
        academicYearId
      },
      include: {
        semester: true
      },
      orderBy: {
        semester: { startDate: 'asc' }
      }
    }),

    prisma.subjectGradeResult.findMany({
      where: {
        schoolId,
        studentId,
        academicYearId
      },
      include: {
        subject: true,
        semester: true
      },
      orderBy: {
        subject: { name: 'asc' }
      }
    }),

    prisma.academicPerformanceSummary.findMany({
      where: {
        schoolId,
        studentId,
        academicYearId
      },
      orderBy: {
        generatedAt: 'desc'
      }
    })
  ]);

  return {
    studentId,
    academicYearId,
    annualAverage,
    semesterAverages,
    subjectResults,
    summaries
  };
};
