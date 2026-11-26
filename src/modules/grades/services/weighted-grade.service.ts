
import { prisma } from "../../../database/index.js";
import { AppError } from "../../../utils/app-error.js";

const roundValue = (value: number, places: number) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

// ============================================
// CALCULATE WEIGHTED SUBJECT GRADE
// ============================================

export const calculateWeightedSubjectGrade = async (
  schoolId: string,
  input: {
    studentId: string;
    subjectId: string;
    academicYearId: string;
    semesterId: string;
  },
) => {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      select: { gradeId: true, sectionId: true },
    });

    if (!enrollment) {
      throw new AppError("Student enrollment not found.", 404);
    }

    if (!enrollment.gradeId) {
      throw new AppError(
        "Student enrollment does not have an assigned grade.",
        409,
      );
    }

    const configuration =
      await tx.academicGradingConfiguration.findFirst({
        where: {
          schoolId,
          academicYearId: input.academicYearId,
          isActive: true,
        },
        include: {
          gradingSystem: {
            include: { gradeScales: true },
          },
        },
      });

    if (!configuration) {
      throw new AppError(
        "Active grading configuration not found.",
        404,
      );
    }

    if (configuration.calculationMethod !== "WEIGHTED_AVERAGE") {
      throw new AppError(
        "The academic grading configuration does not use weighted averages.",
        409,
      );
    }

    const subjectWeight = await tx.academicSubjectWeight.findFirst({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        gradeId: enrollment.gradeId,
        subjectId: input.subjectId,
        isActive: true,
      },
    });

    if (!subjectWeight) {
      throw new AppError(
        "No active weight is configured for this subject and grade.",
        409,
      );
    }

    const assessments = await tx.markRecord.findMany({
      where: {
        schoolId,
        studentId: input.studentId,
        status: "PUBLISHED",
        examination: {
          schoolId,
          subjectId: input.subjectId,
          academicYearId: input.academicYearId,
          semesterId: input.semesterId,
          status: "COMPLETED",
          OR: [
            { sectionId: null },
            { sectionId: enrollment.sectionId },
          ],
        },
      },
      include: {
        examination: {
          select: {
            id: true,
            name: true,
            totalMarks: true,
            weight: true,
          },
        },
      },
    });

    if (!assessments.length) {
      throw new AppError(
        "No published assessment marks are available.",
        409,
      );
    }

    let weightedTotal = 0;
    let totalWeight = 0;

    const details = assessments.map((record) => {
      const maximum = Number(record.examination.totalMarks);
      const weight = Number(record.examination.weight ?? 0);

      if (maximum <= 0 || weight <= 0) {
        throw new AppError(
          `Assessment "${record.examination.name}" must have a positive maximum mark and weight.`,
          400,
        );
      }

      const obtained =
        Number(record.obtainedMarks) +
        Number(record.bonusMarks) -
        Number(record.penaltyMarks);

      const percentage = (obtained / maximum) * 100;

      weightedTotal += percentage * weight;
      totalWeight += weight;

      return {
        examinationId: record.examination.id,
        examinationName: record.examination.name,
        obtainedMarks: obtained,
        maximumMarks: maximum,
        percentage,
        weight,
        weightedContribution: percentage * weight,
      };
    });

    if (totalWeight <= 0) {
      throw new AppError(
        "Total assessment weight must be positive.",
        400,
      );
    }

    const rawPercentage = weightedTotal / totalWeight;

    const finalPercentage = roundValue(
      rawPercentage,
      configuration.decimalPlaces,
    );

    const scales = configuration.gradingSystem.gradeScales;

    // Use the actual Prisma GradeScale field names.
    const matchingScale = scales.find(
      (scale) =>
        finalPercentage >= Number(scale.minimumScore) &&
        finalPercentage <= Number(scale.maximumScore),
    );

    if (!matchingScale) {
      throw new AppError(
        "No matching grade scale was found.",
        409,
      );
    }

    const result = await tx.subjectGradeResult.upsert({
      where: {
        schoolId_studentId_subjectId_academicYearId_semesterId: {
          schoolId,
          studentId: input.studentId,
          subjectId: input.subjectId,
          academicYearId: input.academicYearId,
          semesterId: input.semesterId,
        },
      },

      create: {
        schoolId,
        ...input,
        rawPercentage,
        finalPercentage,
        letterGrade: matchingScale.letterGrade,
        gradePoint: matchingScale.gradePoint,
        gradeRemark: matchingScale.description,
        assessmentCount: assessments.length,
        calculationDetails: {
          calculationMethod: "WEIGHTED_AVERAGE",
          subjectWeight: Number(subjectWeight.weight),
          totalAssessmentWeight: totalWeight,
          assessments: details,
        },
      },

      update: {
        rawPercentage,
        finalPercentage,
        letterGrade: matchingScale.letterGrade,
        gradePoint: matchingScale.gradePoint,
        gradeRemark: matchingScale.description,
        assessmentCount: assessments.length,
        calculationDetails: {
          calculationMethod: "WEIGHTED_AVERAGE",
          subjectWeight: Number(subjectWeight.weight),
          totalAssessmentWeight: totalWeight,
          assessments: details,
        },
        calculatedAt: new Date(),
      },
    });

    return result;
  });
};

// ============================================
// CALCULATE WEIGHTED SEMESTER AVERAGE
// ============================================

export const calculateWeightedSemesterAverage = async (
  schoolId: string,
  input: {
    studentId: string;
    academicYearId: string;
    semesterId: string;
  },
) => {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      select: { gradeId: true },
    });

    if (!enrollment) {
      throw new AppError("Student enrollment not found.", 404);
    }

    if (!enrollment.gradeId) {
      throw new AppError(
        "Student enrollment does not have an assigned grade.",
        409,
      );
    }

    const configuration =
      await tx.academicGradingConfiguration.findFirst({
        where: {
          schoolId,
          academicYearId: input.academicYearId,
          isActive: true,
        },
        select: {
          decimalPlaces: true,
          passingPercentage: true,
        },
      });

    if (!configuration) {
      throw new AppError(
        "Active grading configuration not found.",
        404,
      );
    }

    const results = await tx.subjectGradeResult.findMany({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        semesterId: input.semesterId,
      },
    });

    if (!results.length) {
      throw new AppError(
        "No subject results are available.",
        409,
      );
    }

    const weights = await tx.academicSubjectWeight.findMany({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        gradeId: enrollment.gradeId,
        isActive: true,
        subjectId: {
          in: results.map((item) => item.subjectId),
        },
      },
    });

    const weightMap = new Map(
      weights.map((item) => [
        item.subjectId,
        Number(item.weight),
      ]),
    );

    let weightedTotal = 0;
    let totalWeight = 0;

    const details = results.map((result) => {
      const weight = weightMap.get(result.subjectId);

      if (weight === undefined || weight <= 0) {
        throw new AppError(
          `A positive subject weight is required for subject ${result.subjectId}.`,
          409,
        );
      }

      const percentage = Number(result.finalPercentage);

      weightedTotal += percentage * weight;
      totalWeight += weight;

      return {
        subjectId: result.subjectId,
        percentage,
        weight,
        weightedContribution: percentage * weight,
      };
    });

    if (totalWeight <= 0) {
      throw new AppError(
        "Total subject weight must be positive.",
        400,
      );
    }

    const averagePercentage = roundValue(
      weightedTotal / totalWeight,
      configuration.decimalPlaces,
    );

    const gradePoints = results
      .filter((item) => item.gradePoint !== null)
      .map((item) => ({
        subjectId: item.subjectId,
        gradePoint: Number(item.gradePoint),
        weight: weightMap.get(item.subjectId) ?? 0,
      }));

    const gradePointWeight = gradePoints.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    const averageGradePoint =
      gradePointWeight > 0
        ? roundValue(
            gradePoints.reduce(
              (sum, item) =>
                sum + item.gradePoint * item.weight,
              0,
            ) / gradePointWeight,
            configuration.decimalPlaces,
          )
        : null;

    const passingPercentage = Number(
      configuration.passingPercentage,
    );

    const passedSubjects = results.filter(
      (item) =>
        Number(item.finalPercentage) >= passingPercentage,
    ).length;

    const result = await tx.semesterAcademicAverage.upsert({
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
        totalSubjects: results.length,
        passedSubjects,
        failedSubjects: results.length - passedSubjects,
        calculationDetails: {
          calculationMethod: "WEIGHTED_SUBJECT_AVERAGE",
          passingPercentage,
          totalWeight,
          subjects: details,
        },
      },

      update: {
        averagePercentage,
        averageGradePoint,
        totalSubjects: results.length,
        passedSubjects,
        failedSubjects: results.length - passedSubjects,
        calculationDetails: {
          calculationMethod: "WEIGHTED_SUBJECT_AVERAGE",
          passingPercentage,
          totalWeight,
          subjects: details,
        },
        calculatedAt: new Date(),
      },
    });

    return result;
  });
};

// ============================================
// CALCULATE WEIGHTED ANNUAL AVERAGE
// ============================================

export const calculateWeightedAnnualAverage = async (
  schoolId: string,
  input: {
    studentId: string;
    academicYearId: string;
  },
) => {
  return prisma.$transaction(async (tx) => {
    const configuration =
      await tx.academicGradingConfiguration.findFirst({
        where: {
          schoolId,
          academicYearId: input.academicYearId,
          isActive: true,
        },
        select: {
          decimalPlaces: true,
          passingPercentage: true,
        },
      });

    if (!configuration) {
      throw new AppError(
        "Active grading configuration not found.",
        404,
      );
    }

    const semesterResults =
      await tx.semesterAcademicAverage.findMany({
        where: {
          schoolId,
          studentId: input.studentId,
          academicYearId: input.academicYearId,
        },
      });

    if (!semesterResults.length) {
      throw new AppError(
        "No semester averages are available.",
        409,
      );
    }

    const weights = await tx.academicSemesterWeight.findMany({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        isActive: true,
        semesterId: {
          in: semesterResults.map((item) => item.semesterId),
        },
      },
    });

    const weightMap = new Map(
      weights.map((item) => [
        item.semesterId,
        Number(item.weight),
      ]),
    );

    let weightedTotal = 0;
    let totalWeight = 0;

    const details = semesterResults.map((result) => {
      const weight = weightMap.get(result.semesterId);

      if (weight === undefined || weight <= 0) {
        throw new AppError(
          `A positive weight is required for semester ${result.semesterId}.`,
          409,
        );
      }

      const percentage = Number(result.averagePercentage);

      weightedTotal += percentage * weight;
      totalWeight += weight;

      return {
        semesterId: result.semesterId,
        percentage,
        weight,
        weightedContribution: percentage * weight,
      };
    });

    if (totalWeight <= 0) {
      throw new AppError(
        "Total semester weight must be positive.",
        400,
      );
    }

    const averagePercentage = roundValue(
      weightedTotal / totalWeight,
      configuration.decimalPlaces,
    );

    const gradePoints = semesterResults
      .filter((item) => item.averageGradePoint !== null)
      .map((item) => ({
        semesterId: item.semesterId,
        gradePoint: Number(item.averageGradePoint),
        weight: weightMap.get(item.semesterId) ?? 0,
      }));

    const gradePointWeight = gradePoints.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    const averageGradePoint =
      gradePointWeight > 0
        ? roundValue(
            gradePoints.reduce(
              (sum, item) =>
                sum + item.gradePoint * item.weight,
              0,
            ) / gradePointWeight,
            configuration.decimalPlaces,
          )
        : null;

    const passingPercentage = Number(
      configuration.passingPercentage,
    );

    const passedSemesters = semesterResults.filter(
      (item) =>
        Number(item.averagePercentage) >= passingPercentage,
    ).length;

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
        totalSemesters: semesterResults.length,
        passedSemesters,
        failedSemesters:
          semesterResults.length - passedSemesters,
        calculationDetails: {
          calculationMethod: "WEIGHTED_SEMESTER_AVERAGE",
          passingPercentage,
          totalWeight,
          semesters: details,
        },
      },

      update: {
        averagePercentage,
        averageGradePoint,
        totalSemesters: semesterResults.length,
        passedSemesters,
        failedSemesters:
          semesterResults.length - passedSemesters,
        calculationDetails: {
          calculationMethod: "WEIGHTED_SEMESTER_AVERAGE",
          passingPercentage,
          totalWeight,
          semesters: details,
        },
        calculatedAt: new Date(),
      },
    });
  });
};
