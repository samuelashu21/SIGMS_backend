
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  z
} from 'zod';

import {
  createHomeroomAssignmentSchema,
  updateHomeroomAssignmentSchema
} from '../validators/homeroom-teacher-assignment.validator.js';

type CreateInput = z.infer<
  typeof createHomeroomAssignmentSchema
>;

type UpdateInput = z.infer<
  typeof updateHomeroomAssignmentSchema
>;

export const assignHomeroomTeacher = async (
  schoolId: string,
  sectionId: string,
  input: CreateInput
) => {
  return prisma.$transaction(async (tx) => {
    const teacher = await tx.teacherProfile.findFirst({
      where: {
        id: input.teacherId,
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
        id: sectionId,
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

    const existing = await tx.homeroomTeacherAssignment.findFirst({
      where: {
        schoolId,
        sectionId,
        academicYearId: input.academicYearId
      }
    });

    if (existing) {
      throw new AppError(
        'A homeroom teacher is already assigned to this section for this academic year.',
        409
      );
    }

    const teacherAssignment =
      await tx.teacherClassAssignment.findFirst({
        where: {
          schoolId,
          teacherId: input.teacherId,
          sectionId,
          academicYearId: input.academicYearId,
          isActive: true
        },
        select: { id: true }
      });

    if (!teacherAssignment) {
      throw new AppError(
        'Teacher must have an active class assignment before becoming its homeroom teacher.',
        409
      );
    }

    return tx.homeroomTeacherAssignment.create({
      data: {
        schoolId,
        sectionId,
        teacherId: input.teacherId,
        academicYearId: input.academicYearId
      },
      include: {
        teacher: true,
        section: {
          include: {
            grade: true
          }
        },
        academicYear: true
      }
    });
  });
};

export const getHomeroomTeacherAssignment = async (
  schoolId: string,
  sectionId: string,
  academicYearId: string
) => {
  return prisma.homeroomTeacherAssignment.findFirst({
    where: {
      schoolId,
      sectionId,
      academicYearId,
      isActive: true
    },
    include: {
      teacher: true,
      section: {
        include: {
          grade: true
        }
      },
      academicYear: true
    }
  });
};

export const getTeacherHomeroomAssignments = async (
  schoolId: string,
  teacherId: string,
  academicYearId?: string
) => {
  const teacher = await prisma.teacherProfile.findFirst({
    where: {
      id: teacherId,
      schoolId
    },
    select: { id: true }
  });

  if (!teacher) {
    throw new AppError('Teacher profile not found.', 404);
  }

  return prisma.homeroomTeacherAssignment.findMany({
    where: {
      schoolId,
      teacherId,
      isActive: true,
      ...(academicYearId && { academicYearId })
    },
    include: {
      section: {
        include: {
          grade: true
        }
      },
      academicYear: true
    },
    orderBy: {
      assignedAt: 'desc'
    }
  });
};

export const updateHomeroomTeacherAssignment = async (
  schoolId: string,
  sectionId: string,
  assignmentId: string,
  input: UpdateInput
) => {
  return prisma.$transaction(async (tx) => {
    const assignment = await tx.homeroomTeacherAssignment.findFirst({
      where: {
        id: assignmentId,
        schoolId,
        sectionId,
        isActive: true
      }
    });

    if (!assignment) {
      throw new AppError('Homeroom assignment not found.', 404);
    }

    const teacher = await tx.teacherProfile.findFirst({
      where: {
        id: input.teacherId,
        schoolId,
        isActive: true
      },
      select: { id: true }
    });

    if (!teacher) {
      throw new AppError('Active teacher profile not found.', 404);
    }

    const classAssignment = await tx.teacherClassAssignment.findFirst({
      where: {
        schoolId,
        teacherId: input.teacherId,
        sectionId,
        academicYearId: assignment.academicYearId,
        isActive: true
      },
      select: { id: true }
    });

    if (!classAssignment) {
      throw new AppError(
        'Teacher must have an active class assignment for this section and academic year.',
        409
      );
    }

    return tx.homeroomTeacherAssignment.update({
      where: { id: assignmentId },
      data: {
        teacherId: input.teacherId
      },
      include: {
        teacher: true,
        section: true,
        academicYear: true
      }
    });
  });
};
