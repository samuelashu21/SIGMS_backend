
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const assignStudentGrade = async (
  schoolId: string,
  enrollmentId: string,
  gradeId: string
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
