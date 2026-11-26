import { prisma } from "../../../database/index.js";
import { AppError } from "../../../utils/app-error.js";

type SemesterAverageInput = {
  studentId: string;
  academicYearId: string;
  semesterId: string;
};

const roundAverage = (value: number, decimalPlaces = 2) => {
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
};

export const calculateSemesterAverage = async (
  schoolId: string,
  input: SemesterAverageInput,
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

    const semester = await tx.semester.findFirst({
      where: {
        id: input.semesterId,
        schoolId,
        academicYearId: input.academicYearId,
      },
      select: { id: true },
    });

    if (!semester) {
      throw new AppError(
        "Semester does not belong to the selected academic year.",
        404,
      );
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

    const subjectResults = await tx.subjectGradeResult.findMany({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        semesterId: input.semesterId,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        subject: {
          name: "asc",
        },
      },
    });

    if (subjectResults.length === 0) {
      throw new AppError(
        "No calculated subject grades are available for this semester.",
        409,
      );
    }

    const percentages = subjectResults.map((result) =>
      Number(result.finalPercentage),
    );

    const averagePercentage = roundAverage(
      percentages.reduce((sum, value) => sum + value, 0) / percentages.length,
      configuration.decimalPlaces,
    );

    const gradePoints = subjectResults
      .map((result) =>
        result.gradePoint === null ? null : Number(result.gradePoint),
      )
      .filter((value): value is number => value !== null);

    const averageGradePoint =
      gradePoints.length > 0
        ? roundAverage(
            gradePoints.reduce((sum, value) => sum + value, 0) /
              gradePoints.length,
            configuration.decimalPlaces,
          )
        : null;

    const passedSubjects = percentages.filter(
      (percentage) => percentage >= Number(configuration.passingPercentage),
    ).length;

    const failedSubjects = subjectResults.length - passedSubjects;

    const calculationDetails = subjectResults.map((result) => ({
      subjectId: result.subjectId,
      subjectName: result.subject.name,
      percentage: Number(result.finalPercentage),
      letterGrade: result.letterGrade,
      gradePoint: result.gradePoint === null ? null : Number(result.gradePoint),
    }));

    return tx.semesterAcademicAverage.upsert({
      where: {
        schoolId_studentId_academicYearId_semesterId: {
          schoolId,
          studentId: input.studentId,
          academicYearId: input.academicYearId,
          semesterId: input.semesterId,
        },
      },
      create: {
        schoolId,
        ...input,
        averagePercentage,
        averageGradePoint,
        totalSubjects: subjectResults.length,
        passedSubjects,
        failedSubjects,
        calculationDetails,
      },
      update: {
        averagePercentage,
        averageGradePoint,
        totalSubjects: subjectResults.length,
        passedSubjects,
        failedSubjects,
        calculationDetails,
        calculatedAt: new Date(),
      },
    });
  });
};

export const getSemesterAverageByStudent = async (
  schoolId: string,
  studentId: string,
  academicYearId: string,
  semesterId: string,
) => {
  const result = await prisma.semesterAcademicAverage.findFirst({
    where: {
      schoolId,
      studentId,
      academicYearId,
      semesterId,
    },
    include: {
      student: true,
      academicYear: true,
      semester: true,
    },
  });

  if (!result) {
    throw new AppError("Semester average not found.", 404);
  }

  return result;
};

export const getSemesterAverages = async (
  schoolId: string,
  filters: {
    studentId?: string;
    academicYearId?: string;
    semesterId?: string;
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
    ...(filters.semesterId && { semesterId: filters.semesterId }),
  };

  const [records, total] = await prisma.$transaction([
    prisma.semesterAcademicAverage.findMany({
      where,
      include: {
        student: true,
        academicYear: true,
        semester: true,
      },
      orderBy: [
        { academicYearId: "desc" },
        { semesterId: "asc" },
        { averagePercentage: "desc" },
      ],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.semesterAcademicAverage.count({ where }),
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
