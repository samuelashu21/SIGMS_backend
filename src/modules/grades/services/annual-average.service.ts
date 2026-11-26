import { prisma } from "../../../database/index.js";
import { AppError } from "../../../utils/app-error.js";

type AnnualAverageInput = {
  studentId: string;
  academicYearId: string;
};

const roundAnnualAverage = (value: number, decimalPlaces = 2) => {
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
};

export const calculateAnnualAverage = async (
  schoolId: string,
  input: AnnualAverageInput,
) => {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
      },
      select: { id: true },
    });

    if (!enrollment) {
      throw new AppError(
        "Student does not have an active enrollment in this academic year.",
        404,
      );
    }

    const academicYear = await tx.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId,
      },
      select: { id: true },
    });

    if (!academicYear) {
      throw new AppError("Academic year not found.", 404);
    }

    const configuration = await tx.academicGradingConfiguration.findFirst({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        isActive: true,
      },
      select: {
        passingPercentage: true,
        decimalPlaces: true,
      },
    });

    if (!configuration) {
      throw new AppError(
        "No active grading configuration exists for this academic year.",
        409,
      );
    }

    const semesterAverages = await tx.semesterAcademicAverage.findMany({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
      },
      include: {
        semester: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        semester: {
          startDate: "asc",
        },
      },
    });

    if (semesterAverages.length === 0) {
      throw new AppError(
        "No semester averages are available for this academic year.",
        409,
      );
    }

    const percentages = semesterAverages.map((average) =>
      Number(average.averagePercentage),
    );

    const averagePercentage = roundAnnualAverage(
      percentages.reduce((sum, value) => sum + value, 0) / percentages.length,
      configuration.decimalPlaces,
    );

    const gradePoints = semesterAverages
      .map((average) =>
        average.averageGradePoint === null
          ? null
          : Number(average.averageGradePoint),
      )
      .filter((value): value is number => value !== null);

    const averageGradePoint =
      gradePoints.length > 0
        ? roundAnnualAverage(
            gradePoints.reduce((sum, value) => sum + value, 0) /
              gradePoints.length,
            configuration.decimalPlaces,
          )
        : null;

    const passedSemesters = percentages.filter(
      (percentage) => percentage >= Number(configuration.passingPercentage),
    ).length;

    const failedSemesters = semesterAverages.length - passedSemesters;

    const calculationDetails = semesterAverages.map((average) => ({
      semesterId: average.semesterId,
      semesterName: average.semester.name,
      averagePercentage: Number(average.averagePercentage),
      averageGradePoint:
        average.averageGradePoint === null
          ? null
          : Number(average.averageGradePoint),
      totalSubjects: average.totalSubjects,
      passedSubjects: average.passedSubjects,
      failedSubjects: average.failedSubjects,
    }));

    return tx.annualAcademicAverage.upsert({
      where: {
        schoolId_studentId_academicYearId: {
          schoolId,
          studentId: input.studentId,
          academicYearId: input.academicYearId,
        },
      },
      create: {
        schoolId,
        ...input,
        averagePercentage,
        averageGradePoint,
        totalSemesters: semesterAverages.length,
        passedSemesters,
        failedSemesters,
        calculationDetails,
      },
      update: {
        averagePercentage,
        averageGradePoint,
        totalSemesters: semesterAverages.length,
        passedSemesters,
        failedSemesters,
        calculationDetails,
        calculatedAt: new Date(),
      },
    });
  });
};

export const getAnnualAverageByStudent = async (
  schoolId: string,
  studentId: string,
  academicYearId: string,
) => {
  const result = await prisma.annualAcademicAverage.findFirst({
    where: {
      schoolId,
      studentId,
      academicYearId,
    },
    include: {
      student: true,
      academicYear: true,
    },
  });

  if (!result) {
    throw new AppError("Annual average not found.", 404);
  }

  return result;
};

export const getAnnualAverages = async (
  schoolId: string,
  filters: {
    studentId?: string;
    academicYearId?: string;
    page: number;
    limit: number;
  },
) => {
  const where = {
    schoolId,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.academicYearId && {
      academicYearId: filters.academicYearId,
    }),
  };

  const [records, total] = await prisma.$transaction([
    prisma.annualAcademicAverage.findMany({
      where,
      include: {
        student: true,
        academicYear: true,
      },
      orderBy: {
        averagePercentage: "desc",
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.annualAcademicAverage.count({ where }),
  ]);

  return {
    records,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
};
