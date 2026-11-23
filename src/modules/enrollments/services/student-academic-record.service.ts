
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateStudentAcademicRecordInput
} from '../validators/student-academic-record.validator.js';

export const createStudentAcademicRecord = async (
  schoolId: string,
  studentId: string,
  createdById: string,
  input: CreateStudentAcademicRecordInput
) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: {
        id: studentId,
        schoolId
      },
      select: { id: true }
    });

    if (!student) {
      throw new AppError('Student not found.', 404);
    }

    if (input.enrollmentId) {
      const enrollment = await tx.academicEnrollment.findFirst({
        where: {
          id: input.enrollmentId,
          schoolId,
          studentId
        },
        select: { id: true }
      });

      if (!enrollment) {
        throw new AppError(
          'Academic enrollment does not belong to this student.',
          409
        );
      }
    }

    return tx.studentAcademicRecord.create({
      data: {
        schoolId,
        studentId,
        createdById,
        enrollmentId: input.enrollmentId,
        recordType: input.recordType,
        title: input.title,
        description: input.description,
        subjectName: input.subjectName,
        recordDate: new Date(
          `${input.recordDate}T00:00:00.000Z`
        )
      },
      include: {
        enrollment: {
          include: {
            academicYear: true,
            grade: true,
            section: true
          }
        },
        createdBy: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  });
};

export const getStudentAcademicRecords = async (
  schoolId: string,
  studentId: string
) => {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      schoolId
    },
    select: { id: true }
  });

  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  return prisma.studentAcademicRecord.findMany({
    where: {
      schoolId,
      studentId
    },
    include: {
      enrollment: {
        include: {
          academicYear: true,
          grade: true,
          section: true
        }
      },
      createdBy: {
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: [
      { recordDate: 'desc' },
      { createdAt: 'desc' }
    ]
  });
};
