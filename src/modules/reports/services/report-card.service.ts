
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type GenerateReportInput = {
  studentId: string;
  enrollmentId: string;
  academicYearId: string;
  periodType: 'SEMESTER' | 'ANNUAL';
  semesterId?: string;
};

// ============================================
// GENERATE STUDENT REPORT CARD
// ============================================

export const generateStudentReportCard = async (
  schoolId: string,
  createdById: string,
  input: GenerateReportInput
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Validate enrollment
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        id: input.enrollmentId,
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        status: {
          in: ['ACTIVE', 'COMPLETED']
        }
      },
      include: {
        student: true,
        grade: true,
        section: true
      }
    });

    if (!enrollment) {
      throw new AppError('Student enrollment not found.', 404);
    }

    // 2. Validate required grade and section IDs.
    // AcademicEnrollment may allow nullable gradeId/sectionId,
    // but ReportCard requires valid IDs.

    const gradeId = enrollment.gradeId;
    const sectionId = enrollment.sectionId;

    if (!gradeId || !sectionId) {
      throw new AppError(
        'Student enrollment must have an assigned grade and section before generating a report card.',
        400
      );
    }

    // 3. Validate semester
    if (
      input.periodType === 'SEMESTER' &&
      !input.semesterId
    ) {
      throw new AppError('Semester is required.', 400);
    }

    const semester = input.semesterId
      ? await tx.semester.findFirst({
          where: {
            id: input.semesterId,
            schoolId,
            academicYearId: input.academicYearId
          }
        })
      : null;

    if (input.semesterId && !semester) {
      throw new AppError('Semester not found.', 404);
    }

    // 4. Determine reporting period
    const periodKey =
      input.periodType === 'ANNUAL'
        ? 'ANNUAL'
        : `SEMESTER:${input.semesterId}`;

    // 5. Fetch academic summary, subject results and existing report
    const [summary, subjectResults, existing] = await Promise.all([
      tx.academicPerformanceSummary.findFirst({
        where: {
          schoolId,
          studentId: input.studentId,
          academicYearId: input.academicYearId,
          periodKey,
          summaryType: input.periodType
        }
      }),

      tx.subjectGradeResult.findMany({
        where: {
          schoolId,
          studentId: input.studentId,
          academicYearId: input.academicYearId,
          ...(input.semesterId && {
            semesterId: input.semesterId
          })
        },
        include: {
          subject: true
        },
        orderBy: {
          subject: {
            name: 'asc'
          }
        }
      }),

      tx.reportCard.findFirst({
        where: {
          schoolId,
          studentId: input.studentId,
          academicYearId: input.academicYearId,
          periodType: input.periodType,
          ...(input.semesterId
            ? { semesterId: input.semesterId }
            : { semesterId: null })
        }
      })
    ]);

    if (!summary || subjectResults.length === 0) {
      throw new AppError(
        'Calculate academic results and generate a performance summary first.',
        409
      );
    }

    if (existing?.status === 'PUBLISHED') {
      throw new AppError(
        'A published report card cannot be regenerated.',
        409
      );
    }

    // 6. Group subject results
    const subjectGroups = new Map<string, typeof subjectResults>();

    for (const result of subjectResults) {
      const group = subjectGroups.get(result.subjectId) ?? [];

      group.push(result);

      subjectGroups.set(result.subjectId, group);
    }

    // 7. Generate report subjects
    const reportSubjects = Array.from(subjectGroups.entries()).map(
      ([subjectId, results]) => {
        const averagePercentage =
          results.reduce(
            (sum, result) =>
              sum + Number(result.finalPercentage),
            0
          ) / results.length;

        const latest = results[results.length - 1];

        const normalizedPercentage = Number(
          averagePercentage.toFixed(2)
        );

        return {
          schoolId,
          subjectId,
          subjectName: latest.subject.name,
          maximumMarks: 100,
          obtainedMarks: normalizedPercentage,
          percentage: normalizedPercentage,
          letterGrade: latest.letterGrade,
          gradePoint: latest.gradePoint,
          gradeRemark: latest.gradeRemark
        };
      }
    );

    // 8. Calculate attendance
    const attendanceRecords = await tx.attendanceRecord.findMany({
      where: {
        schoolId,
        studentId: input.studentId,
        classAttendance: {
          schoolId,
          academicYearId: input.academicYearId,
          status: 'APPROVED',
          ...(semester && {
            attendanceDate: {
              gte: semester.startDate,
              lte: semester.endDate
            }
          })
        }
      },
      select: {
        status: true
      }
    });

    const countStatus = (status: string) =>
      attendanceRecords.filter(
        (record) => record.status === status
      ).length;

    const presentDays = countStatus('PRESENT');
    const absentDays = countStatus('ABSENT');
    const lateDays = countStatus('LATE');
    const excusedDays = countStatus('EXCUSED');
    const halfDays = countStatus('HALF_DAY');

    const attendancePercentage =
      attendanceRecords.length > 0
        ? Number(
            (
              ((presentDays + lateDays + halfDays) /
                attendanceRecords.length) *
              100
            ).toFixed(2)
          )
        : null;

    // 9. Generate report number
    const reportNumber =
      existing?.reportNumber ??
      `RPT-${Date.now()}-${input.studentId.slice(0, 8)}`;

    // 10. Report card data
    // gradeId and sectionId are now guaranteed strings.

    const reportData = {
      schoolId,
      studentId: input.studentId,
      enrollmentId: input.enrollmentId,
      academicYearId: input.academicYearId,
      semesterId: input.semesterId ?? null,
      periodType: input.periodType,
      gradeId,
      sectionId,
      reportNumber,
      overallPercentage: summary.overallPercentage,
      overallGradePoint: summary.overallGradePoint,
      totalSubjects: summary.totalSubjects,
      passedSubjects: summary.passedSubjects,
      failedSubjects: summary.failedSubjects,
      attendancePercentage,
      status: 'GENERATED' as const,
      generatedAt: new Date(),
      createdById
    };

    // 11. Attendance snapshot
    // schoolId is excluded because it is not defined
    // in the ReportCardAttendance Prisma model.

    const attendanceData = {
      totalSessions: attendanceRecords.length,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      halfDays,
      attendancePercentage
    };

    // 12. Create or regenerate report card

    const reportCard = existing
      ? await tx.reportCard.update({
          where: {
            id: existing.id
          },
          data: {
            ...reportData,

            subjects: {
              deleteMany: {},
              create: reportSubjects
            },

            attendance: {
              upsert: {
                create: attendanceData,
                update: attendanceData
              }
            },

            history: {
              create: {
                performedById: createdById,
                action: 'GENERATED',
                description: 'Report card regenerated.'
              }
            }
          },
          include: {
            subjects: true,
            attendance: true
          }
        })
      : await tx.reportCard.create({
          data: {
            ...reportData,

            subjects: {
              create: reportSubjects
            },

            attendance: {
              create: attendanceData
            },

            history: {
              create: {
                performedById: createdById,
                action: 'GENERATED',
                description: 'Student report card generated.'
              }
            }
          },
          include: {
            subjects: true,
            attendance: true
          }
        });

    return reportCard;
  });
};

// ============================================
// GET SINGLE REPORT CARD
// ============================================

export const getStudentReportCard = async (
  schoolId: string,
  reportCardId: string
) => {
  const report = await prisma.reportCard.findFirst({
    where: {
      id: reportCardId,
      schoolId
    },
    include: {
      student: true,
      academicYear: true,
      semester: true,
      grade: true,
      section: true,

      subjects: {
        orderBy: {
          subjectName: 'asc'
        }
      },

      attendance: true,

      history: {
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          performedBy: {
            select: {
              id: true,
              username: true
            }
          }
        }
      }
    }
  });

  if (!report) {
    throw new AppError('Report card not found.', 404);
  }

  return report;
};

// ============================================
// GET REPORT CARDS WITH PAGINATION
// ============================================

export const getStudentReportCards = async (
  schoolId: string,
  filters: {
    studentId?: string;
    academicYearId?: string;
    semesterId?: string;
    periodType?: 'SEMESTER' | 'ANNUAL';
    status?: 'DRAFT' | 'GENERATED' | 'PUBLISHED' | 'WITHDRAWN';
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

    ...(filters.periodType && {
      periodType: filters.periodType
    }),

    ...(filters.status && {
      status: filters.status
    })
  };

  const [records, total] = await prisma.$transaction([
    prisma.reportCard.findMany({
      where,
      include: {
        student: true,
        academicYear: true,
        semester: true,
        grade: true,
        section: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),

    prisma.reportCard.count({
      where
    })
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

// ============================================
// UPDATE REPORT CARD REMARKS
// ============================================

export const updateReportCardRemarks = async (
  schoolId: string,
  reportCardId: string,
  input: {
    teacherRemarks?: string;
    principalRemarks?: string;
  },
  performedById: string
) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.reportCard.findFirst({
      where: {
        id: reportCardId,
        schoolId
      }
    });

    if (!existing) {
      throw new AppError('Report card not found.', 404);
    }

    if (
      existing.status === 'PUBLISHED' ||
      existing.status === 'WITHDRAWN'
    ) {
      throw new AppError(
        'This report card cannot be edited.',
        409
      );
    }

    const updated = await tx.reportCard.update({
      where: {
        id: existing.id
      },
      data: {
        ...input,

        history: {
          create: {
            performedById,
            action: 'UPDATED',
            description: 'Report card remarks updated.',

            previousValues: {
              teacherRemarks: existing.teacherRemarks,
              principalRemarks: existing.principalRemarks
            },

            newValues: input
          }
        }
      }
    });

    return updated;
  });
};
