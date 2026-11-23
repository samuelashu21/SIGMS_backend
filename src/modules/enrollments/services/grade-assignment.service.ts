
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  recordEnrollmentHistory
} from './enrollment-history.service.js';

export const assignStudentGrade = async (
  schoolId: string,
  enrollmentId: string,
  gradeId: string,
  changedById: string
) => {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        id: enrollmentId,
        schoolId
      }
    });

    if (!enrollment) {
      throw new AppError('Academic enrollment not found.', 404);
    }

    const grade = await tx.grade.findFirst({
      where: {
        id: gradeId,
        schoolId
      }
    });

    if (!grade) {
      throw new AppError(
        'Grade does not exist in this school.',
        404
      );
    }

    // Capture previous grade and section before updating.
    const previousGradeId = enrollment.gradeId;
    const previousSectionId = enrollment.sectionId;

    await tx.academicEnrollment.updateMany({
      where: {
        id: enrollmentId,
        schoolId
      },
      data: {
        gradeId,
        // A previous section may not belong to the new grade.
        sectionId: null
      }
    });

    // Record grade assignment history.
    await recordEnrollmentHistory(tx, {
      schoolId,
      enrollmentId,
      changedById,
      action: 'GRADE_ASSIGNED',
      previousGradeId,
      newGradeId: gradeId,
      previousSectionId,
      newSectionId: null,
      reason: 'Student grade assignment updated.'
    });

    return tx.academicEnrollment.findFirstOrThrow({
      where: {
        id: enrollmentId,
        schoolId
      },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            fullName: true
          }
        },
        academicYear: true,
        grade: true,
        section: true
      }
    });
  });
};

export const getStudentGradeAssignments = async (
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
      academicYear: true,
      grade: true,
      section: true
    },
    orderBy: {
      enrollmentDate: 'desc'
    }
  });
};
