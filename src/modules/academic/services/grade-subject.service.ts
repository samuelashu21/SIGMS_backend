
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateGradeSubjectInput,
  UpdateGradeSubjectInput
} from '../validators/grade-subject.validator.js';

export const assignSubjectToGrade = async (
  schoolId: string,
  input: CreateGradeSubjectInput
) => {
  const [grade, subject] = await Promise.all([
    prisma.grade.findFirst({
      where: {
        id: input.gradeId,
        schoolId,
        isActive: true
      }
    }),
    prisma.subject.findFirst({
      where: {
        id: input.subjectId,
        schoolId,
        isActive: true
      }
    })
  ]);

  if (!grade) throw new AppError('Active grade not found.', 404);
  if (!subject) throw new AppError('Active subject not found.', 404);

  const existing = await prisma.gradeSubject.findUnique({
    where: {
      schoolId_gradeId_subjectId: {
        schoolId,
        gradeId: input.gradeId,
        subjectId: input.subjectId
      }
    }
  });

  if (existing) {
    throw new AppError('Subject is already assigned to this grade.', 409);
  }

  return prisma.gradeSubject.create({
    data: {
      schoolId,
      gradeId: input.gradeId,
      subjectId: input.subjectId,
      weeklyPeriods: input.weeklyPeriods,
      isCompulsory: input.isCompulsory
    },
    include: {
      grade: true,
      subject: true
    }
  });
};

export const getGradeSubjectAssignments = async (
  schoolId: string,
  gradeId: string
) => {
  const grade = await prisma.grade.findFirst({
    where: { id: gradeId, schoolId }
  });

  if (!grade) throw new AppError('Grade not found.', 404);

  return prisma.gradeSubject.findMany({
    where: { schoolId, gradeId },
    include: {
      subject: true
    },
    orderBy: {
      subject: { name: 'asc' }
    }
  });
};

export const updateGradeSubjectAssignment = async (
  schoolId: string,
  assignmentId: string,
  input: UpdateGradeSubjectInput
) => {
  const assignment = await prisma.gradeSubject.findFirst({
    where: { id: assignmentId, schoolId }
  });

  if (!assignment) {
    throw new AppError('Subject-grade assignment not found.', 404);
  }

  return prisma.gradeSubject.update({
    where: { id: assignmentId },
    data: input,
    include: {
      grade: true,
      subject: true
    }
  });
};

export const removeGradeSubjectAssignment = async (
  schoolId: string,
  assignmentId: string
) => {
  const assignment = await prisma.gradeSubject.findFirst({
    where: { id: assignmentId, schoolId }
  });

  if (!assignment) {
    throw new AppError('Subject-grade assignment not found.', 404);
  }

  return prisma.gradeSubject.update({
    where: { id: assignmentId },
    data: { isActive: false }
  });
};
