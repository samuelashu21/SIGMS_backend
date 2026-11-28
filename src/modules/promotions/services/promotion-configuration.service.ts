
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type CreatePromotionConfigurationInput = {
  academicYearId: string;
  name: string;
  decisionType:
    | 'AUTOMATIC_ELIGIBILITY'
    | 'MANUAL_REVIEW'
    | 'EXAMINATION_BASED'
    | 'PERFORMANCE_BASED';

  minimumOverallPercentage?: number;
  minimumGradePoint?: number;
  minimumAttendancePercentage?: number;

  minimumPassedSubjects: number;
  maximumFailedSubjects: number;

  requireAllCoreSubjectsPassed: boolean;
  requireCompletedExaminations: boolean;
  requireApprovedResults: boolean;

  allowManualOverride: boolean;
  requirePrincipalApproval: boolean;

  gradeRules: Array<{
    gradeId: string;
    minimumOverallPercentage?: number;
    minimumGradePoint?: number;
    minimumAttendancePercentage?: number;
    minimumPassedSubjects?: number;
    maximumFailedSubjects?: number;
    requireAllCoreSubjectsPassed?: boolean;
    allowPromotion: boolean;
  }>;
};

export const createPromotionConfiguration = async (
  schoolId: string,
  createdById: string,
  input: CreatePromotionConfigurationInput
) => {
  return prisma.$transaction(async (tx) => {
    const academicYear = await tx.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      },
      select: { id: true }
    });

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }

    const existing = await tx.promotionConfiguration.findFirst({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        name: input.name
      },
      select: { id: true }
    });

    if (existing) {
      throw new AppError(
        'A promotion configuration with this name already exists.',
        409
      );
    }

    const gradeIds = [
      ...new Set(input.gradeRules.map((rule) => rule.gradeId))
    ];

    if (gradeIds.length !== input.gradeRules.length) {
      throw new AppError(
        'Duplicate grade rules are not allowed.',
        400
      );
    }

    const grades = await tx.grade.findMany({
      where: {
        schoolId,
        id: { in: gradeIds }
      },
      select: { id: true }
    });

    if (grades.length !== gradeIds.length) {
      throw new AppError(
        'One or more grades do not belong to this school.',
        400
      );
    }

    return tx.promotionConfiguration.create({
      data: {
        schoolId,
        academicYearId: input.academicYearId,
        name: input.name,
        decisionType: input.decisionType,

        minimumOverallPercentage: input.minimumOverallPercentage,
        minimumGradePoint: input.minimumGradePoint,
        minimumAttendancePercentage:
          input.minimumAttendancePercentage,

        minimumPassedSubjects: input.minimumPassedSubjects,
        maximumFailedSubjects: input.maximumFailedSubjects,

        requireAllCoreSubjectsPassed:
          input.requireAllCoreSubjectsPassed,

        requireCompletedExaminations:
          input.requireCompletedExaminations,

        requireApprovedResults: input.requireApprovedResults,

        allowManualOverride: input.allowManualOverride,
        requirePrincipalApproval: input.requirePrincipalApproval,

        createdById,

        gradeRules: {
          create: input.gradeRules.map((rule) => ({
            schoolId,
            gradeId: rule.gradeId,
            minimumOverallPercentage:
              rule.minimumOverallPercentage,
            minimumGradePoint: rule.minimumGradePoint,
            minimumAttendancePercentage:
              rule.minimumAttendancePercentage,
            minimumPassedSubjects: rule.minimumPassedSubjects,
            maximumFailedSubjects: rule.maximumFailedSubjects,
            requireAllCoreSubjectsPassed:
              rule.requireAllCoreSubjectsPassed,
            allowPromotion: rule.allowPromotion
          }))
        }
      },
      include: {
        gradeRules: {
          include: { grade: true }
        },
        academicYear: true
      }
    });
  });
};

export const getPromotionConfigurations = async (
  schoolId: string,
  academicYearId?: string
) => {
  return prisma.promotionConfiguration.findMany({
    where: {
      schoolId,
      ...(academicYearId && { academicYearId })
    },
    include: {
      academicYear: true,
      gradeRules: {
        include: { grade: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updatePromotionConfiguration = async (
  schoolId: string,
  configurationId: string,
  updatedById: string,
  input: {
    name?: string;
    decisionType?: CreatePromotionConfigurationInput['decisionType'];
    minimumOverallPercentage?: number;
    minimumGradePoint?: number;
    minimumAttendancePercentage?: number;
    minimumPassedSubjects?: number;
    maximumFailedSubjects?: number;
    requireAllCoreSubjectsPassed?: boolean;
    requireCompletedExaminations?: boolean;
    requireApprovedResults?: boolean;
    allowManualOverride?: boolean;
    requirePrincipalApproval?: boolean;
  }
) => {
  const configuration = await prisma.promotionConfiguration.findFirst({
    where: { id: configurationId, schoolId },
    select: { id: true, status: true }
  });

  if (!configuration) {
    throw new AppError('Promotion configuration not found.', 404);
  }

  if (configuration.status !== 'ACTIVE') {
    throw new AppError(
      'Inactive promotion configurations cannot be edited.',
      409
    );
  }

  return prisma.promotionConfiguration.update({
    where: { id: configurationId },
    data: {
      ...input,
      updatedById
    }
  });
};

export const deactivatePromotionConfiguration = async (
  schoolId: string,
  configurationId: string,
  updatedById: string
) => {
  const configuration = await prisma.promotionConfiguration.findFirst({
    where: {
      id: configurationId,
      schoolId
    },
    select: { id: true }
  });

  if (!configuration) {
    throw new AppError('Promotion configuration not found.', 404);
  }

  return prisma.promotionConfiguration.update({
    where: { id: configurationId },
    data: {
      status: 'INACTIVE',
      updatedById
    }
  });
};
