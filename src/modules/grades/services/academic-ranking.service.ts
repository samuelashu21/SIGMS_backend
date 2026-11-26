
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type RankingInput = {
  academicYearId: string;
  gradeId: string;
  period: 'SEMESTER' | 'ANNUAL';
  semesterId?: string;
};

export const configureAcademicRanking = async (
  schoolId: string,
  input: {
    academicYearId: string;
    gradeId: string;
    rankingEnabled: boolean;
    rankingScope: 'GRADE' | 'SECTION';
    allowStudentVisibility: boolean;
    allowParentVisibility: boolean;
    minimumStudents: number;
    includeTies: boolean;
  }
) => {
  const [year, grade] = await Promise.all([
    prisma.academicYear.findFirst({
      where: { id: input.academicYearId, schoolId },
      select: { id: true }
    }),
    prisma.grade.findFirst({
      where: { id: input.gradeId, schoolId },
      select: { id: true }
    })
  ]);

  if (!year || !grade) {
    throw new AppError('Academic year or grade not found.', 404);
  }

  return prisma.academicRankingConfiguration.upsert({
    where: {
      schoolId_academicYearId_gradeId: {
        schoolId,
        academicYearId: input.academicYearId,
        gradeId: input.gradeId
      }
    },
    create: {
      schoolId,
      ...input
    },
    update: input
  });
};

export const calculateAcademicRankings = async (
  schoolId: string,
  input: RankingInput
) => {
  return prisma.$transaction(async (tx) => {
    const configuration =
      await tx.academicRankingConfiguration.findFirst({
        where: {
          schoolId,
          academicYearId: input.academicYearId,
          gradeId: input.gradeId
        }
      });

    if (!configuration || !configuration.rankingEnabled) {
      throw new AppError(
        'Academic rankings are not enabled for this grade.',
        403
      );
    }

    if (
      configuration.rankingScope === 'SECTION' &&
      input.period === 'SEMESTER' &&
      !input.semesterId
    ) {
      throw new AppError('Semester is required.', 400);
    }

    if (input.semesterId) {
      const semester = await tx.semester.findFirst({
        where: {
          id: input.semesterId,
          schoolId,
          academicYearId: input.academicYearId
        },
        select: { id: true }
      });

      if (!semester) {
        throw new AppError('Semester not found.', 404);
      }
    }

    const enrollments = await tx.academicEnrollment.findMany({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        gradeId: input.gradeId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      },
      select: {
        studentId: true,
        sectionId: true
      }
    });

    const studentIds = enrollments.map((item) => item.studentId);

    if (!studentIds.length) {
      throw new AppError(
        'No enrolled students were found for this grade.',
        409
      );
    }

    const averages = input.period === 'ANNUAL'
      ? await tx.annualAcademicAverage.findMany({
          where: {
            schoolId,
            academicYearId: input.academicYearId,
            studentId: { in: studentIds }
          },
          select: {
            studentId: true,
            averagePercentage: true
          }
        })
      : await tx.semesterAcademicAverage.findMany({
          where: {
            schoolId,
            academicYearId: input.academicYearId,
            semesterId: input.semesterId,
            studentId: { in: studentIds }
          },
          select: {
            studentId: true,
            averagePercentage: true
          }
        });

    const enrollmentMap = new Map(
      enrollments.map((item) => [
        item.studentId,
        item.sectionId
      ])
    );

    const groups = new Map<
      string,
      Array<{ studentId: string; score: number; sectionId: string }>
    >();

    for (const average of averages) {
      const sectionId = enrollmentMap.get(average.studentId);

      if (!sectionId) continue;

      const scopeKey = configuration.rankingScope === 'GRADE'
        ? `GRADE:${input.gradeId}`
        : `SECTION:${sectionId}`;

      const group = groups.get(scopeKey) ?? [];

      group.push({
        studentId: average.studentId,
        score: Number(average.averagePercentage),
        sectionId
      });

      groups.set(scopeKey, group);
    }

    const periodKey = input.period === 'ANNUAL'
      ? 'ANNUAL'
      : `SEMESTER:${input.semesterId}`;

    // Remove existing rankings for the selected academic period and grade.
    // This happens once before processing any ranking groups.
    await tx.academicStudentRanking.deleteMany({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        gradeId: input.gradeId,
        periodKey
      }
    });

    const createdRecords = [];

    for (const [scopeKey, group] of groups.entries()) {
      if (group.length < configuration.minimumStudents) {
        continue;
      }

      group.sort((a, b) => b.score - a.score);

      const records = group.map((item, index) => {
        const tied = group.filter(
          (candidate) => candidate.score === item.score
        ).length > 1;

        const rank = configuration.includeTies
          ? group.filter(
              (candidate) => candidate.score > item.score
            ).length + 1
          : index + 1;

        return {
          schoolId,
          studentId: item.studentId,
          academicYearId: input.academicYearId,
          gradeId: input.gradeId,
          sectionId: item.sectionId,
          semesterId: input.semesterId ?? null,
          period: input.period,
          periodKey,
          scope: configuration.rankingScope,
          scopeKey,
          rank,
          score: item.score,
          totalStudents: group.length,
          tied,
          calculatedAt: new Date()
        };
      });

      await tx.academicStudentRanking.createMany({
        data: records
      });

      createdRecords.push(...records);
    }

    return {
      period: input.period,
      periodKey,
      scope: configuration.rankingScope,
      rankedStudents: createdRecords.length,
      groups: groups.size
    };
  });
};

export const getAcademicRankings = async (
  schoolId: string,
  filters: {
    academicYearId: string;
    gradeId: string;
    period: 'SEMESTER' | 'ANNUAL';
    semesterId?: string;
    sectionId?: string;
    page: number;
    limit: number;
  }
) => {
  const periodKey = filters.period === 'ANNUAL'
    ? 'ANNUAL'
    : `SEMESTER:${filters.semesterId}`;

  const configuration =
    await prisma.academicRankingConfiguration.findFirst({
      where: {
        schoolId,
        academicYearId: filters.academicYearId,
        gradeId: filters.gradeId,
        rankingEnabled: true
      }
    });

  if (!configuration) {
    throw new AppError('Rankings are not enabled.', 403);
  }

  const scopeKey = configuration.rankingScope === 'GRADE'
    ? `GRADE:${filters.gradeId}`
    : filters.sectionId
      ? `SECTION:${filters.sectionId}`
      : undefined;

  if (!scopeKey) {
    throw new AppError(
      'A section ID is required for section-level rankings.',
      400
    );
  }

  const where = {
    schoolId,
    academicYearId: filters.academicYearId,
    gradeId: filters.gradeId,
    periodKey,
    scopeKey
  };

  const [records, total] = await prisma.$transaction([
    prisma.academicStudentRanking.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            fullName: true
          }
        }
      },
      orderBy: [
        { rank: 'asc' },
        { student: { fullName: 'asc' } }
      ],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.academicStudentRanking.count({ where })
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

export const getStudentAcademicRanking = async (
  schoolId: string,
  studentId: string,
  filters: {
    academicYearId: string;
    gradeId: string;
    period: 'SEMESTER' | 'ANNUAL';
    semesterId?: string;
    viewer: 'STUDENT' | 'PARENT'
  }
) => {
  const configuration =
    await prisma.academicRankingConfiguration.findFirst({
      where: {
        schoolId,
        academicYearId: filters.academicYearId,
        gradeId: filters.gradeId,
        rankingEnabled: true
      }
    });

  if (!configuration) {
    throw new AppError('Rankings are not enabled.', 403);
  }

  if (
    filters.viewer === 'STUDENT' &&
    !configuration.allowStudentVisibility
  ) {
    throw new AppError('Student ranking visibility is disabled.', 403);
  }

  if (
    filters.viewer === 'PARENT' &&
    !configuration.allowParentVisibility
  ) {
    throw new AppError('Parent ranking visibility is disabled.', 403);
  }

  const periodKey = filters.period === 'ANNUAL'
    ? 'ANNUAL'
    : `SEMESTER:${filters.semesterId}`;

  const enrollment = await prisma.academicEnrollment.findFirst({
    where: {
      schoolId,
      studentId,
      academicYearId: filters.academicYearId,
      gradeId: filters.gradeId,
      status: { in: ['ACTIVE', 'COMPLETED'] }
    },
    select: { sectionId: true }
  });

  if (!enrollment) {
    throw new AppError('Student enrollment not found.', 404);
  }

  const scopeKey = configuration.rankingScope === 'GRADE'
    ? `GRADE:${filters.gradeId}`
    : `SECTION:${enrollment.sectionId}`;

  const ranking = await prisma.academicStudentRanking.findFirst({
    where: {
      schoolId,
      studentId,
      academicYearId: filters.academicYearId,
      periodKey,
      scopeKey
    }
  });

  if (!ranking) {
    throw new AppError('Student ranking is not available.', 404);
  }

  return ranking;
};
