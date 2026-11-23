
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  recordEnrollmentHistory
} from './enrollment-history.service.js';

export const assignStudentSection = async (
  schoolId: string,
  enrollmentId: string,
  sectionId: string,
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

    if (!enrollment.gradeId) {
      throw new AppError(
        'Assign a grade before assigning a section.',
        409
      );
    }

    const section = await tx.section.findFirst({
      where: {
        id: sectionId,
        schoolId,
        gradeId: enrollment.gradeId,
        academicYearId: enrollment.academicYearId
      }
    });

    if (!section) {
      throw new AppError(
        'Section does not belong to the assigned grade and academic year.',
        409
      );
    }

    if (section.capacity !== null) {
      const assignedCount = await tx.academicEnrollment.count({
        where: {
          schoolId,
          sectionId,
          id: { not: enrollmentId }
        }
      });

      if (assignedCount >= section.capacity) {
        throw new AppError(
          'The selected section has reached its capacity.',
          409
        );
      }
    }

    await tx.academicEnrollment.updateMany({
      where: {
        id: enrollmentId,
        schoolId
      },
      data: {
        sectionId
      }
    });

    // Record section assignment history.
    await recordEnrollmentHistory(tx, {
      schoolId,
      enrollmentId,
      changedById,
      action: 'SECTION_ASSIGNED',
      previousSectionId: enrollment.sectionId,
      newSectionId: sectionId,
      reason: 'Student section assignment updated.'
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
