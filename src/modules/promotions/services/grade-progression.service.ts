
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type CreateRuleInput = {
  academicYearId: string;
  currentGradeId: string;
  nextGradeId?: string | null;
  isGraduationGrade: boolean;
  description?: string;
};

export const createGradeProgressionRule = async (
  schoolId: string,
  input: CreateRuleInput
) => {
  if (input.isGraduationGrade && input.nextGradeId) {
    throw new AppError(
      'Graduation grades cannot have a next grade.',
      400
    );
  }

  if (!input.isGraduationGrade && !input.nextGradeId) {
    throw new AppError(
      'A next grade is required for normal progression.',
      400
    );
  }

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

    const grades = await tx.grade.findMany({
      where: {
        schoolId,
        id: {
          in: [
            input.currentGradeId,
            ...(input.nextGradeId ? [input.nextGradeId] : [])
          ]
        }
      },
      select: { id: true }
    });

    const expectedCount = input.nextGradeId ? 2 : 1;

    if (grades.length !== expectedCount) {
      throw new AppError(
        'One or more grades do not belong to this school.',
        400
      );
    }

    const existing = await tx.gradeProgressionRule.findFirst({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        currentGradeId: input.currentGradeId
      }
    });

    if (existing) {
      throw new AppError(
        'A progression rule already exists for this grade and academic year.',
        409
      );
    }

    return tx.gradeProgressionRule.create({
      data: {
        schoolId,
        academicYearId: input.academicYearId,
        currentGradeId: input.currentGradeId,
        nextGradeId: input.nextGradeId ?? null,
        isGraduationGrade: input.isGraduationGrade,
        description: input.description
      },
      include: {
        currentGrade: true,
        nextGrade: true,
        academicYear: true
      }
    });
  });
};

export const getGradeProgressionRules = async (
  schoolId: string,
  academicYearId: string
) => {
  return prisma.gradeProgressionRule.findMany({
    where: {
      schoolId,
      academicYearId
    },
    include: {
      currentGrade: true,
      nextGrade: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
};

export const updateGradeProgressionRule = async (
  schoolId: string,
  ruleId: string,
  input: {
    nextGradeId?: string | null;
    isGraduationGrade?: boolean;
    isActive?: boolean;
    description?: string;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const rule = await tx.gradeProgressionRule.findFirst({
      where: {
        id: ruleId,
        schoolId
      }
    });

    if (!rule) {
      throw new AppError('Grade progression rule not found.', 404);
    }

    const isGraduationGrade =
      input.isGraduationGrade ?? rule.isGraduationGrade;

    const nextGradeId =
      input.nextGradeId !== undefined
        ? input.nextGradeId
        : rule.nextGradeId;

    if (isGraduationGrade && nextGradeId) {
      throw new AppError(
        'Graduation grades cannot have a next grade.',
        400
      );
    }

    if (!isGraduationGrade && !nextGradeId) {
      throw new AppError(
        'A next grade is required for normal progression.',
        400
      );
    }

    if (nextGradeId) {
      const nextGrade = await tx.grade.findFirst({
        where: {
          id: nextGradeId,
          schoolId
        },
        select: { id: true }
      });

      if (!nextGrade) {
        throw new AppError('Next grade not found.', 404);
      }

      if (nextGradeId === rule.currentGradeId) {
        throw new AppError(
          'A grade cannot progress to itself.',
          400
        );
      }
    }

    return tx.gradeProgressionRule.update({
      where: { id: rule.id },
      data: {
        nextGradeId,
        isGraduationGrade,
        isActive: input.isActive,
        description: input.description
      },
      include: {
        currentGrade: true,
        nextGrade: true
      }
    });
  });
};

export const resolveNextGrade = async (
  schoolId: string,
  academicYearId: string,
  currentGradeId: string
) => {
  const rule = await prisma.gradeProgressionRule.findFirst({
    where: {
      schoolId,
      academicYearId,
      currentGradeId,
      isActive: true
    },
    include: {
      currentGrade: true,
      nextGrade: true
    }
  });

  if (!rule) {
    throw new AppError(
      'No active progression rule exists for this grade.',
      404
    );
  }

  if (rule.isGraduationGrade) {
    return {
      isGraduationGrade: true,
      currentGrade: rule.currentGrade,
      nextGrade: null
    };
  }

  return {
    isGraduationGrade: false,
    currentGrade: rule.currentGrade,
    nextGrade: rule.nextGrade
  };
};
