
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  z
} from 'zod';

import {
  createTeacherClassAssignmentSchema,
  updateTeacherClassAssignmentSchema
} from '../validators/teacher-class-assignment.validator.js';

type CreateInput = z.infer<
  typeof createTeacherClassAssignmentSchema
>;

type UpdateInput = z.infer<
  typeof updateTeacherClassAssignmentSchema
>;

export const createTeacherClassAssignment = async (
  schoolId: string,
  teacherId: string,
  input: CreateInput
) => {
  return prisma.$transaction(async (tx) => {
    const teacher = await tx.teacherProfile.findFirst({
      where: {
        id: teacherId,
        schoolId,
        isActive: true
      },
      select: { id: true }
    });

    if (!teacher) {
      throw new AppError('Active teacher profile not found.', 404);
    }

    const section = await tx.section.findFirst({
      where: {
        id: input.sectionId,
        schoolId,
        academicYearId: input.academicYearId
      },
      select: { id: true }
    });

    if (!section) {
      throw new AppError(
        'Section does not belong to the selected academic year and school.',
        404
      );
    }

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

    return tx.teacherClassAssignment.create({
      data: {
        schoolId,
        teacherId,
        sectionId: input.sectionId,
        academicYearId: input.academicYearId
      },
      include: {
        teacher: true,
        section: {
          include: {
            grade: true,
            academicYear: true
          }
        },
        academicYear: true
      }
    });
  });
};

export const getTeacherClassAssignments = async (
  schoolId: string,
  teacherId: string,
  academicYearId?: string
) => {
  const teacher = await prisma.teacherProfile.findFirst({
    where: { id: teacherId, schoolId },
    select: { id: true }
  });

  if (!teacher) {
    throw new AppError('Teacher profile not found.', 404);
  }

  return prisma.teacherClassAssignment.findMany({
    where: {
      schoolId,
      teacherId,
      ...(academicYearId && { academicYearId })
    },
    include: {
      section: {
        include: {
          grade: true,
          academicYear: true
        }
      },
      academicYear: true
    },
    orderBy: [
      { academicYear: { startDate: 'desc' } },
      { section: { name: 'asc' } }
    ]
  });
};

export const updateTeacherClassAssignment = async (
  schoolId: string,
  teacherId: string,
  assignmentId: string,
  input: UpdateInput
) => {
  const result = await prisma.teacherClassAssignment.updateMany({
    where: {
      id: assignmentId,
      schoolId,
      teacherId
    },
    data: {
      isActive: input.isActive
    }
  });

  if (result.count !== 1) {
    throw new AppError('Teacher class assignment not found.', 404);
  }

  return prisma.teacherClassAssignment.findFirstOrThrow({
    where: {
      id: assignmentId,
      schoolId,
      teacherId
    },
    include: {
      section: true,
      academicYear: true
    }
  });
};
