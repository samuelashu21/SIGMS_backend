
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type CreateAcademicGradingInput = {
  academicYearId: string;
  gradingSystemId: string;
  calculationMethod: 'WEIGHTED_AVERAGE' | 'SIMPLE_AVERAGE';
  passingPercentage: number;
  decimalPlaces: number;
  roundingMode: 'ROUND' | 'ROUND_UP' | 'ROUND_DOWN';
  requireAllAssessments: boolean;
  isActive: boolean;
};

export const createAcademicGradingConfiguration = async (
  schoolId: string,
  input: CreateAcademicGradingInput
) => {
  const [academicYear, gradingSystem] = await Promise.all([
    prisma.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      },
      select: { id: true }
    }),
    prisma.gradingSystem.findFirst({
      where: {
        id: input.gradingSystemId,
        schoolId
      },
      select: { id: true }
    })
  ]);

  if (!academicYear) {
    throw new AppError('Academic year not found.', 404);
  }

  if (!gradingSystem) {
    throw new AppError('Grading system not found.', 404);
  }

  const existing = await prisma.academicGradingConfiguration.findFirst({
    where: {
      schoolId,
      academicYearId: input.academicYearId,
      gradingSystemId: input.gradingSystemId
    }
  });

  if (existing) {
    throw new AppError(
      'An academic grading configuration already exists for this grading system and academic year.',
      409
    );
  }

  return prisma.academicGradingConfiguration.create({
    data: {
      schoolId,
      ...input
    },
    include: {
      academicYear: true,
      gradingSystem: true
    }
  });
};

export const getAcademicGradingConfigurations = async (
  schoolId: string,
  academicYearId?: string
) => {
  return prisma.academicGradingConfiguration.findMany({
    where: {
      schoolId,
      ...(academicYearId && { academicYearId })
    },
    include: {
      academicYear: true,
      gradingSystem: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getAcademicGradingConfiguration = async (
  schoolId: string,
  configurationId: string
) => {
  const configuration =
    await prisma.academicGradingConfiguration.findFirst({
      where: {
        id: configurationId,
        schoolId
      },
      include: {
        academicYear: true,
        gradingSystem: true
      }
    });

  if (!configuration) {
    throw new AppError('Academic grading configuration not found.', 404);
  }

  return configuration;
};

export const updateAcademicGradingConfiguration = async (
  schoolId: string,
  configurationId: string,
  input: {
    calculationMethod?: 'WEIGHTED_AVERAGE' | 'SIMPLE_AVERAGE';
    passingPercentage?: number;
    decimalPlaces?: number;
    roundingMode?: 'ROUND' | 'ROUND_UP' | 'ROUND_DOWN';
    requireAllAssessments?: boolean;
    isActive?: boolean;
  }
) => {
  const existing = await prisma.academicGradingConfiguration.findFirst({
    where: {
      id: configurationId,
      schoolId
    }
  });

  if (!existing) {
    throw new AppError('Academic grading configuration not found.', 404);
  }

  return prisma.academicGradingConfiguration.update({
    where: {
      id: existing.id
    },
    data: input,
    include: {
      academicYear: true,
      gradingSystem: true
    }
  });
};
