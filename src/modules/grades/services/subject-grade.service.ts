
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type SubjectGradeInput = {
  studentId: string;
  subjectId: string;
  academicYearId: string;
  semesterId: string;
};

const roundGrade = (
  value: number,
  decimalPlaces: number,
  mode: 'ROUND' | 'ROUND_UP' | 'ROUND_DOWN'
): number => {
  const factor = 10 ** decimalPlaces;

  if (mode === 'ROUND_UP') {
    return Math.ceil(value * factor) / factor;
  }

  if (mode === 'ROUND_DOWN') {
    return Math.floor(value * factor) / factor;
  }

  return Math.round(value * factor) / factor;
};

// Calculate student subject grade
export const calculateSubjectGrade = async (
  schoolId: string,
  input: SubjectGradeInput
) => {
  return prisma.$transaction(async (tx) => {
    // Verify active student enrollment
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        gradeId: true,
        sectionId: true
      }
    });

    if (!enrollment) {
      throw new AppError(
        'Student has no active enrollment for this academic year.',
        404
      );
    }

    // Load subject, semester and grading configuration
    const [subject, semester, configuration] = await Promise.all([
      tx.subject.findFirst({
        where: {
          id: input.subjectId,
          schoolId
        },
        select: {
          id: true
        }
      }),

      tx.semester.findFirst({
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
      }),

      tx.academicGradingConfiguration.findFirst({
        where: {
          schoolId,
          academicYearId: input.academicYearId,
          isActive: true
        },
        include: {
          gradingSystem: {
            include: {
              gradeScales: true
            }
          }
        }
      })
    ]);

    if (!subject) {
      throw new AppError('Subject not found.', 404);
    }

    if (!semester) {
      throw new AppError(
        'Semester not found for the selected academic year.',
        404
      );
    }

    if (!configuration) {
      throw new AppError(
        'No active academic grading configuration exists.',
        409
      );
    }

    // Retrieve published assessment marks
    const assessments = await tx.markRecord.findMany({
      where: {
        schoolId,
        studentId: input.studentId,
        status: 'PUBLISHED',
        examination: {
          schoolId,
          subjectId: input.subjectId,
          academicYearId: input.academicYearId,
          semesterId: input.semesterId,
          status: 'COMPLETED'
        }
      },

      include: {
        examination: {
          select: {
            id: true,
            name: true,
            totalMarks: true,
            weight: true
          }
        }
      },

      orderBy: {
        createdAt: 'asc'
      }
    });

    if (assessments.length === 0) {
      throw new AppError(
        'No published assessment marks are available for this subject.',
        409
      );
    }

    // Ensure all completed assessments have published marks
    if (configuration.requireAllAssessments) {
      const expectedCount = await tx.examination.count({
        where: {
          schoolId,
          subjectId: input.subjectId,
          academicYearId: input.academicYearId,
          semesterId: input.semesterId,
          status: 'COMPLETED',
          OR: [
            { sectionId: null },
            { sectionId: enrollment.sectionId }
          ]
        }
      });

      if (assessments.length < expectedCount) {
        throw new AppError(
          'Some completed assessments do not have published marks for this student.',
          409
        );
      }
    }

    // Calculate individual assessment percentages
    const assessmentDetails = assessments.map((record) => {
      const maximumMarks = Number(
        record.examination.totalMarks
      );

      if (maximumMarks <= 0) {
        throw new AppError(
          `Invalid maximum marks for ${record.examination.name}.`,
          400
        );
      }

      const obtained =
        Number(record.obtainedMarks) +
        Number(record.bonusMarks) -
        Number(record.penaltyMarks);

      const percentage =
        (obtained / maximumMarks) * 100;

      return {
        examinationId: record.examination.id,
        examinationName: record.examination.name,
        obtainedMarks: obtained,
        maximumMarks,
        percentage,
        weight: Number(record.examination.weight ?? 1)
      };
    });

    // Calculate final percentage
    let rawPercentage: number;

    if (
      configuration.calculationMethod === 'WEIGHTED_AVERAGE'
    ) {
      const totalWeight = assessmentDetails.reduce(
        (sum, item) => sum + item.weight,
        0
      );

      if (totalWeight <= 0) {
        throw new AppError(
          'Assessment weights must have a positive total.',
          400
        );
      }

      rawPercentage =
        assessmentDetails.reduce(
          (sum, item) =>
            sum + item.percentage * item.weight,
          0
        ) / totalWeight;
    } else {
      rawPercentage =
        assessmentDetails.reduce(
          (sum, item) => sum + item.percentage,
          0
        ) / assessmentDetails.length;
    }

    // Apply configured rounding
    const finalPercentage = roundGrade(
      rawPercentage,
      configuration.decimalPlaces,
      configuration.roundingMode
    );

    // Match percentage against configured grade scales
    const matchingScale =
      configuration.gradingSystem.gradeScales.find(
        (scale) =>
          finalPercentage >= Number(scale.minimumScore) &&
          finalPercentage <= Number(scale.maximumScore)
      );

    if (!matchingScale) {
      throw new AppError(
        'No configured grade scale matches the calculated percentage.',
        409
      );
    }

    // Save or update calculated subject grade
    const result = await tx.subjectGradeResult.upsert({
      where: {
        schoolId_studentId_subjectId_academicYearId_semesterId: {
          schoolId,
          studentId: input.studentId,
          subjectId: input.subjectId,
          academicYearId: input.academicYearId,
          semesterId: input.semesterId
        }
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
        calculationDetails: assessmentDetails
      },

      update: {
        rawPercentage,
        finalPercentage,
        letterGrade: matchingScale.letterGrade,
        gradePoint: matchingScale.gradePoint,
        gradeRemark: matchingScale.description,
        assessmentCount: assessments.length,
        calculationDetails: assessmentDetails,
        calculatedAt: new Date()
      }
    });

    return result;
  });
};

// Get subject grade results with pagination and filters
export const getSubjectGradeResults = async (
  schoolId: string,
  filters: {
    studentId?: string;
    subjectId?: string;
    academicYearId?: string;
    semesterId?: string;
    page: number;
    limit: number;
  }
) => {
  const where = {
    schoolId,

    ...(filters.studentId && {
      studentId: filters.studentId
    }),

    ...(filters.subjectId && {
      subjectId: filters.subjectId
    }),

    ...(filters.academicYearId && {
      academicYearId: filters.academicYearId
    }),

    ...(filters.semesterId && {
      semesterId: filters.semesterId
    })
  };

  const [records, total] = await prisma.$transaction([
    prisma.subjectGradeResult.findMany({
      where,

      include: {
        student: true,
        subject: true,
        academicYear: true,
        semester: true
      },

      orderBy: {
        calculatedAt: 'desc'
      },

      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),

    prisma.subjectGradeResult.count({
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
