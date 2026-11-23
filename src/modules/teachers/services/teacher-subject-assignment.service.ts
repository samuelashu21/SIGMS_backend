
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  z
} from 'zod';

import {
  createTeacherSubjectAssignmentSchema,
  updateTeacherSubjectAssignmentSchema
} from '../validators/teacher-subject-assignment.validator.js';

type CreateAssignmentInput = z.infer<
  typeof createTeacherSubjectAssignmentSchema
>;

type UpdateAssignmentInput = z.infer<
  typeof updateTeacherSubjectAssignmentSchema
>;

export const createTeacherSubjectAssignment = async (
  schoolId: string,
  teacherId: string,
  input: CreateAssignmentInput
) => {
  return prisma.$transaction(async (tx) => {
    const teacher = await tx.teacherProfile.findFirst({
      where: { id: teacherId, schoolId, isActive: true },
      select: { id: true }
    });

    if (!teacher) {
      throw new AppError('Active teacher profile not found.', 404);
    }

    const [subject, grade, academicYear] = await Promise.all([
      tx.subject.findFirst({
        where: { id: input.subjectId, schoolId, isActive: true },
        select: { id: true }
      }),
      tx.grade.findFirst({
        where: { id: input.gradeId, schoolId, isActive: true },
        select: { id: true }
      }),
      tx.academicYear.findFirst({
        where: { id: input.academicYearId, schoolId },
        select: { id: true }
      })
    ]);

    if (!subject || !grade || !academicYear) {
      throw new AppError(
        'Subject, grade, or academic year does not belong to this school or is unavailable.',
        400
      );
    }

    const gradeSubject = await tx.gradeSubject.findFirst({
      where: {
        schoolId,
        subjectId: input.subjectId,
        gradeId: input.gradeId,
        isActive: true
      },
      select: { id: true }
    });

    if (!gradeSubject) {
      throw new AppError(
        'The subject is not assigned to this grade.',
        409
      );
    }

    return tx.teacherSubjectAssignment.create({
      data: {
        schoolId,
        teacherId,
        ...input
      },
      include: {
        teacher: true,
        subject: true,
        grade: true,
        academicYear: true
      }
    });
  });
};

export const getTeacherSubjectAssignments = async (
  schoolId: string,
  teacherId: string,
  academicYearId?: string
) => {
  return prisma.teacherSubjectAssignment.findMany({
    where: {
      schoolId,
      teacherId,
      ...(academicYearId && { academicYearId })
    },
    include: {
      subject: true,
      grade: true,
      academicYear: true
    },
    orderBy: [
      { academicYear: { startDate: 'desc' } },
      { grade: { gradeLevel: 'asc' } },
      { subject: { name: 'asc' } }
    ]
  });
};

export const updateTeacherSubjectAssignment = async (
  schoolId: string,
  teacherId: string,
  assignmentId: string,
  input: UpdateAssignmentInput
) => {
  const assignment = await prisma.teacherSubjectAssignment.findFirst({
    where: {
      id: assignmentId,
      schoolId,
      teacherId
    },
    select: { id: true }
  });

  if (!assignment) {
    throw new AppError('Teacher subject assignment not found.', 404);
  }

  return prisma.teacherSubjectAssignment.update({
    where: { id: assignmentId },
    data: input
  });
};
