
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const linkStudentAccount = async (
  schoolId: string,
  studentId: string,
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: studentId, schoolId },
      select: { id: true }
    });

    if (!student) {
      throw new AppError('Student not found.', 404);
    }

    const user = await tx.user.findFirst({
      where: {
        id: userId,
        role: 'STUDENT',
        isActive: true,
        deletedAt: null,
        memberships: {
          some: {
            schoolId,
            role: 'STUDENT',
            isActive: true
          }
        }
      },
      select: { id: true }
    });

    if (!user) {
      throw new AppError(
        'An active student account with school membership is required.',
        400
      );
    }

    const existingStudentLink = await tx.studentAccountLink.findFirst({
      where: {
        schoolId,
        studentId,
        isActive: true
      }
    });

    if (existingStudentLink) {
      throw new AppError(
        'This student already has an active account link.',
        409
      );
    }

    const existingUserLink = await tx.studentAccountLink.findFirst({
      where: {
        schoolId,
        userId,
        isActive: true
      }
    });

    if (existingUserLink) {
      throw new AppError(
        'This user is already linked to a student.',
        409
      );
    }

    return tx.studentAccountLink.create({
      data: {
        schoolId,
        studentId,
        userId,
        isActive: true,
        verifiedAt: new Date()
      }
    });
  });
};
