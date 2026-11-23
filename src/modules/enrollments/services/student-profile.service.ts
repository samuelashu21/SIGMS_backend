
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  UpdateStudentProfileInput
} from '../validators/student-profile.validator.js';

export const getStudentProfile = async (
  schoolId: string,
  studentId: string
) => {
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      schoolId
    },
    include: {
      profile: true
    }
  });

  if (!student) {
    throw new AppError('Student not found.', 404);
  }

  return student;
};

export const updateStudentProfile = async (
  schoolId: string,
  studentId: string,
  input: UpdateStudentProfileInput
) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: {
        id: studentId,
        schoolId
      }
    });

    if (!student) {
      throw new AppError('Student not found.', 404);
    }

    const {
      fullName,
      dateOfBirth,
      gender,
      ...profileFields
    } = input;

    await tx.student.update({
      where: { id: studentId },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(dateOfBirth !== undefined && {
          dateOfBirth: dateOfBirth
            ? new Date(`${dateOfBirth}T00:00:00.000Z`)
            : null
        }),
        ...(gender !== undefined && { gender })
      }
    });

    await tx.studentProfile.upsert({
      where: {
        studentId_schoolId: {
          studentId,
          schoolId
        }
      },
      create: {
        schoolId,
        studentId,
        ...profileFields
      },
      update: profileFields
    });

    return tx.student.findFirstOrThrow({
      where: {
        id: studentId,
        schoolId
      },
      include: {
        profile: true
      }
    });
  });
};
