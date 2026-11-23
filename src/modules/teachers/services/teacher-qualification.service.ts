
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  z
} from 'zod';

import {
  createTeacherQualificationSchema,
  updateTeacherQualificationSchema
} from '../validators/teacher-qualification.validator.js';

type CreateQualificationInput = z.infer<
  typeof createTeacherQualificationSchema
>;

type UpdateQualificationInput = z.infer<
  typeof updateTeacherQualificationSchema
>;

export const createTeacherQualification = async (
  schoolId: string,
  teacherId: string,
  input: CreateQualificationInput
) => {
  const teacher = await prisma.teacherProfile.findFirst({
    where: { id: teacherId, schoolId },
    select: { id: true }
  });

  if (!teacher) {
    throw new AppError('Teacher profile not found.', 404);
  }

  return prisma.teacherQualification.create({
    data: {
      schoolId,
      teacherId,
      ...input
    }
  });
};

export const getTeacherQualifications = async (
  schoolId: string,
  teacherId: string
) => {
  const teacher = await prisma.teacherProfile.findFirst({
    where: { id: teacherId, schoolId },
    select: { id: true }
  });

  if (!teacher) {
    throw new AppError('Teacher profile not found.', 404);
  }

  return prisma.teacherQualification.findMany({
    where: { schoolId, teacherId },
    orderBy: [
      { graduationYear: 'desc' },
      { createdAt: 'desc' }
    ]
  });
};

export const updateTeacherQualification = async (
  schoolId: string,
  teacherId: string,
  qualificationId: string,
  input: UpdateQualificationInput
) => {
  const qualification = await prisma.teacherQualification.findFirst({
    where: {
      id: qualificationId,
      schoolId,
      teacherId
    },
    select: { id: true }
  });

  if (!qualification) {
    throw new AppError('Teacher qualification not found.', 404);
  }

  return prisma.teacherQualification.update({
    where: { id: qualificationId },
    data: input
  });
};

export const deleteTeacherQualification = async (
  schoolId: string,
  teacherId: string,
  qualificationId: string
) => {
  const result = await prisma.teacherQualification.deleteMany({
    where: {
      id: qualificationId,
      schoolId,
      teacherId
    }
  });

  if (result.count !== 1) {
    throw new AppError('Teacher qualification not found.', 404);
  }

  return { deleted: true };
};
