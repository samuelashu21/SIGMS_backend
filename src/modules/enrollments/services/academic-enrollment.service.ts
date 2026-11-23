
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateAcademicEnrollmentInput
} from '../validators/academic-enrollment.validator.js';

export const createAcademicEnrollment = async (
  schoolId: string,
  studentId: string,
  input: CreateAcademicEnrollmentInput
) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: {
        id: studentId,
        schoolId,
        isActive: true
      }
    });

    if (!student) {
      throw new AppError('Active student not found.', 404);
    }

    if (!student.studentNumber) {
      throw new AppError(
        'Student identification number must be assigned before enrollment.',
        409
      );
    }

    const academicYear = await tx.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      }
    });

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }

    if (academicYear.status === 'COMPLETED') {
      throw new AppError(
        'Cannot enroll a student in a completed academic year.',
        409
      );
    }

    const existingEnrollment = await tx.academicEnrollment.findUnique({
      where: {
        studentId_academicYearId: {
          studentId,
          academicYearId: input.academicYearId
        }
      }
    });

    if (existingEnrollment) {
      throw new AppError(
        'Student is already enrolled in this academic year.',
        409
      );
    }

    return tx.academicEnrollment.create({
      data: {
        schoolId,
        studentId,
        academicYearId: input.academicYearId,
        enrollmentDate: input.enrollmentDate
          ? new Date(`${input.enrollmentDate}T00:00:00.000Z`)
          : new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z')
      },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            fullName: true
          }
        },
        academicYear: true
      }
    });
  });
};

export const getStudentAcademicEnrollments = async (
  schoolId: string,
  studentId: string
) => {
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId },
    select: { id: true }
  });

  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  return prisma.academicEnrollment.findMany({
    where: {
      schoolId,
      studentId
    },
    include: {
      academicYear: true
    },
    orderBy: {
      enrollmentDate: 'desc'
    }
  });
};
