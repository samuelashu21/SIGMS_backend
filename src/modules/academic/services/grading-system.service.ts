
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateGradingSystemInput,
  UpdateGradingSystemInput
} from '../validators/grading-system.validator.js';
import { z } from 'zod';

const validateGradeScales = (
  scales: CreateGradingSystemInput['gradeScales']
) => {
  const sorted = [...scales].sort(
    (a, b) => a.minimumScore - b.minimumScore
  );

  for (let index = 1; index < sorted.length; index++) {
    if (sorted[index]!.minimumScore <= sorted[index - 1]!.maximumScore) {
      throw new AppError(
        'Grade score ranges must not overlap.',
        400
      );
    }
  }
};

export const createGradingSystem = async (
  schoolId: string,
  input: CreateGradingSystemInput
) => {
  validateGradeScales(input.gradeScales);

  const existing = await prisma.gradingSystem.findFirst({
    where: {
      schoolId,
      name: input.name
    }
  });

  if (existing) {
    throw new AppError('Grading system name already exists.', 409);
  }

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.gradingSystem.updateMany({
        where: { schoolId, isDefault: true },
        data: { isDefault: false }
      });
    }

    return tx.gradingSystem.create({
      data: {
        schoolId,
        name: input.name,
        description: input.description,
        isDefault: input.isDefault,
        gradeScales: {
          create: input.gradeScales.map((scale) => ({
            schoolId,
            letterGrade: scale.letterGrade,
            minimumScore: scale.minimumScore,
            maximumScore: scale.maximumScore,
            gradePoint: scale.gradePoint,
            description: scale.description,
            isPassing: scale.isPassing
          }))
        }
      },
      include: {
        gradeScales: {
          orderBy: { minimumScore: 'desc' }
        }
      }
    });
  });
};

export const getGradingSystems = (schoolId: string) => {
  return prisma.gradingSystem.findMany({
    where: { schoolId },
    include: {
      gradeScales: {
        orderBy: { minimumScore: 'desc' }
      }
    },
    orderBy: [
      { isDefault: 'desc' },
      { name: 'asc' }
    ]
  });
};

export const getGradingSystem = async (
  schoolId: string,
  gradingSystemId: string
) => {
  const system = await prisma.gradingSystem.findFirst({
    where: {
      id: gradingSystemId,
      schoolId
    },
    include: {
      gradeScales: {
        orderBy: { minimumScore: 'desc' }
      }
    }
  });

  if (!system) throw new AppError('Grading system not found.', 404);

  return system;
};

export const updateGradingSystem = async (
  schoolId: string,
  gradingSystemId: string,
  input: UpdateGradingSystemInput
) => {
  await getGradingSystem(schoolId, gradingSystemId);

  if (input.name) {
    const duplicate = await prisma.gradingSystem.findFirst({
      where: {
        schoolId,
        name: input.name,
        id: { not: gradingSystemId }
      }
    });

    if (duplicate) {
      throw new AppError('Grading system name already exists.', 409);
    }
  }

  return prisma.gradingSystem.update({
    where: { id: gradingSystemId },
    data: input
  });
};

export const setDefaultGradingSystem = async (
  schoolId: string,
  gradingSystemId: string
) => {
  const system = await getGradingSystem(schoolId, gradingSystemId);

  if (!system.isActive) {
    throw new AppError('An inactive grading system cannot be the default.', 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.gradingSystem.updateMany({
      where: { schoolId, isDefault: true },
      data: { isDefault: false }
    });

    return tx.gradingSystem.update({
      where: { id: gradingSystemId },
      data: { isDefault: true }
    });
  });
};




import type {
  replaceGradeScalesSchema
} from '../validators/grading-system.validator.js';

type ReplaceGradeScalesInput = z.infer<
  typeof replaceGradeScalesSchema
>;

export const replaceGradeScales = async (
  schoolId: string,
  gradingSystemId: string,
  input: ReplaceGradeScalesInput
) => {
  validateGradeScales(input.gradeScales);

  const system = await getGradingSystem(
    schoolId,
    gradingSystemId
  );

  return prisma.$transaction(async (tx) => {
    await tx.gradeScale.deleteMany({
      where: {
        schoolId,
        gradingSystemId
      }
    });

    await tx.gradeScale.createMany({
      data: input.gradeScales.map((scale) => ({
        schoolId,
        gradingSystemId,
        letterGrade: scale.letterGrade,
        minimumScore: scale.minimumScore,
        maximumScore: scale.maximumScore,
        gradePoint: scale.gradePoint,
        description: scale.description,
        isPassing: scale.isPassing
      }))
    });

    return tx.gradingSystem.findUniqueOrThrow({
      where: { id: system.id },
      include: {
        gradeScales: {
          orderBy: { minimumScore: 'desc' }
        }
      }
    });
  });
};
