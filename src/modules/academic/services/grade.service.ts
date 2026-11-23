
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateGradeInput,
  UpdateGradeInput
} from '../validators/grade.validator.js';

export const createGrade = async (
  schoolId: string,
  input: CreateGradeInput
) => {
  const existing = await prisma.grade.findFirst({
    where: {
      schoolId,
      OR: [
        { name: input.name },
        { gradeLevel: input.gradeLevel }
      ]
    }
  });

  if (existing) {
    throw new AppError('Grade name or level already exists.', 409);
  }

  return prisma.grade.create({
    data: {
      schoolId,
      ...input
    }
  });
};

export const getGrades = (schoolId: string) => {
  return prisma.grade.findMany({
    where: { schoolId },
    include: {
      _count: { select: { sections: true } }
    },
    orderBy: { gradeLevel: 'asc' }
  });
};

export const getGrade = async (
  schoolId: string,
  gradeId: string
) => {
  const grade = await prisma.grade.findFirst({
    where: { id: gradeId, schoolId },
    include: { sections: true }
  });

  if (!grade) throw new AppError('Grade not found.', 404);

  return grade;
};

export const updateGrade = async (
  schoolId: string,
  gradeId: string,
  input: UpdateGradeInput
) => {
  const grade = await getGrade(schoolId, gradeId);

  const name = input.name ?? grade.name;
  const gradeLevel = input.gradeLevel ?? grade.gradeLevel;

  const duplicate = await prisma.grade.findFirst({
    where: {
      schoolId,
      id: { not: gradeId },
      OR: [
        { name },
        { gradeLevel }
      ]
    }
  });

  if (duplicate) {
    throw new AppError('Grade name or level already exists.', 409);
  }

  return prisma.grade.update({
    where: { id: gradeId },
    data: input
  });
};
