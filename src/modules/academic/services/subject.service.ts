
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateSubjectInput,
  UpdateSubjectInput
} from '../validators/subject.validator.js';

export const createSubject = async (
  schoolId: string,
  input: CreateSubjectInput
) => {
  const code = input.code.toUpperCase();

  const existing = await prisma.subject.findFirst({
    where: {
      schoolId,
      OR: [
        { code },
        { name: input.name }
      ]
    }
  });

  if (existing) {
    throw new AppError('Subject name or code already exists.', 409);
  }

  return prisma.subject.create({
    data: {
      schoolId,
      ...input,
      code
    }
  });
};

export const getSubjects = (schoolId: string) => {
  return prisma.subject.findMany({
    where: { schoolId },
    include: {
      _count: {
        select: { gradeAssignments: true }
      }
    },
    orderBy: { name: 'asc' }
  });
};

export const getSubject = async (
  schoolId: string,
  subjectId: string
) => {
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, schoolId },
    include: {
      gradeAssignments: {
        include: { grade: true }
      }
    }
  });

  if (!subject) throw new AppError('Subject not found.', 404);

  return subject;
};

export const updateSubject = async (
  schoolId: string,
  subjectId: string,
  input: UpdateSubjectInput
) => {
  const subject = await getSubject(schoolId, subjectId);

  const code = input.code?.toUpperCase() ?? subject.code;
  const name = input.name ?? subject.name;

  const duplicate = await prisma.subject.findFirst({
    where: {
      schoolId,
      id: { not: subjectId },
      OR: [{ code }, { name }]
    }
  });

  if (duplicate) {
    throw new AppError('Subject name or code already exists.', 409);
  }

  return prisma.subject.update({
    where: { id: subjectId },
    data: {
      ...input,
      ...(input.code && { code })
    }
  });
};
