
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const generateAcademicTranscript = async (
  schoolId: string,
  createdById: string,
  studentId: string
) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: {
        id: studentId,
        schoolId
      }
    });

    if (!student) {
      throw new AppError('Student not found.', 404);
    }

    const enrollments = await tx.academicEnrollment.findMany({
      where: {
        schoolId,
        studentId,
        status: {
          in: ['ACTIVE', 'COMPLETED']
        }
      },
      include: {
        academicYear: true,
        grade: true
      },
      orderBy: {
        academicYear: {
          startDate: 'asc'
        }
      }
    });

    if (!enrollments.length) {
      throw new AppError(
        'No academic enrollment history found.',
        409
      );
    }

    const yearIds = enrollments.map(
      (item) => item.academicYearId
    );

    const [annualAverages, semesterResults] = await Promise.all([
      tx.annualAcademicAverage.findMany({
        where: {
          schoolId,
          studentId,
          academicYearId: {
            in: yearIds
          }
        }
      }),

      tx.subjectGradeResult.findMany({
        where: {
          schoolId,
          studentId,
          academicYearId: {
            in: yearIds
          }
        },
        include: {
          subject: true,
          academicYear: true,
          semester: true
        },
        orderBy: [
          {
            academicYear: {
              startDate: 'asc'
            }
          },
          {
            subject: {
              name: 'asc'
            }
          }
        ]
      })
    ]);

    if (!semesterResults.length || !annualAverages.length) {
      throw new AppError(
        'Academic grades and annual averages must be calculated first.',
        409
      );
    }

    const enrollmentByYear = new Map(
      enrollments.map((item) => [
        item.academicYearId,
        item
      ])
    );

    const entries = semesterResults.map((result) => {
      const enrollment = enrollmentByYear.get(
        result.academicYearId
      );

      if (!enrollment) {
        throw new AppError(
          'Academic enrollment information is incomplete.',
          409
        );
      }

      if (!enrollment.grade || !enrollment.gradeId) {
        throw new AppError(
          `Grade information is missing for academic year ${result.academicYear.name}.`,
          409
        );
      }

      return {
        academicYear: {
          connect: {
            id: result.academicYearId
          }
        },
        grade: {
          connect: {
            id: enrollment.gradeId
          }
        },
        subject: {
          connect: {
            id: result.subjectId
          }
        },
        school: {
          connect: {
            id: schoolId
          }
        },
        semesterId: result.semesterId,
        periodKey: `SEMESTER:${result.semesterId}`,
        academicYearName: result.academicYear.name,
        gradeName: enrollment.grade.name,
        semesterName: result.semester.name,
        subjectName: result.subject.name,
        percentage: result.finalPercentage,
        letterGrade: result.letterGrade,
        gradePoint: result.gradePoint,
        gradeRemark: result.gradeRemark
      };
    });

    const totalYears = new Set(yearIds).size;

    const cumulativePercentage =
      annualAverages.reduce(
        (sum, item) =>
          sum + Number(item.averagePercentage),
        0
      ) / annualAverages.length;

    const gradePointResults = annualAverages.filter(
      (item) => item.averageGradePoint !== null
    );

    const cumulativeGradePoint = gradePointResults.length
      ? gradePointResults.reduce(
          (sum, item) =>
            sum + Number(item.averageGradePoint),
          0
        ) / gradePointResults.length
      : null;

    const transcriptNumber =
      `TR-${Date.now()}-${studentId.slice(0, 8)}`;

    const transcript = await tx.studentAcademicTranscript.create({
      data: {
        schoolId,
        studentId,
        transcriptNumber,
        status: 'GENERATED',
        totalAcademicYears: totalYears,
        totalSubjects: entries.length,
        cumulativePercentage: Number(
          cumulativePercentage.toFixed(2)
        ),
        cumulativeGradePoint:
          cumulativeGradePoint === null
            ? null
            : Number(cumulativeGradePoint.toFixed(2)),
        generatedAt: new Date(),
        createdById,

        entries: {
          create: entries
        },

        history: {
          create: {
            performedById: createdById,
            action: 'GENERATED',
            description: 'Academic transcript generated.',
            newValues: {
              totalAcademicYears: totalYears,
              totalSubjects: entries.length,
              cumulativePercentage,
              cumulativeGradePoint
            }
          }
        }
      },
      include: {
        entries: {
          orderBy: [
            {
              academicYearName: 'asc'
            },
            {
              semesterName: 'asc'
            },
            {
              subjectName: 'asc'
            }
          ]
        }
      }
    });

    return transcript;
  });
};

export const getAcademicTranscript = async (
  schoolId: string,
  transcriptId: string
) => {
  const transcript =
    await prisma.studentAcademicTranscript.findFirst({
      where: {
        id: transcriptId,
        schoolId
      },
      include: {
        student: true,
        entries: {
          orderBy: [
            {
              academicYearName: 'asc'
            },
            {
              semesterName: 'asc'
            },
            {
              subjectName: 'asc'
            }
          ]
        },
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

  if (!transcript) {
    throw new AppError('Academic transcript not found.', 404);
  }

  return transcript;
};

export const getAcademicTranscripts = async (
  schoolId: string,
  filters: {
    studentId?: string;
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
    ...(filters.status && {
      status: filters.status
    })
  };

  const [records, total] = await prisma.$transaction([
    prisma.studentAcademicTranscript.findMany({
      where,
      include: {
        student: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),

    prisma.studentAcademicTranscript.count({
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
