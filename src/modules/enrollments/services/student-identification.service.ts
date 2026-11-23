
import type { Prisma } from '../../../generated/prisma/client.js';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const generateStudentNumber = async (
  tx: Prisma.TransactionClient,
  schoolId: string,
  academicYearId: string
) => {
  const [school, academicYear] = await Promise.all([
    tx.school.findUnique({
      where: { id: schoolId },
      select: { schoolCode: true }
    }),
    tx.academicYear.findFirst({
      where: { id: academicYearId, schoolId },
      select: { startDate: true }
    })
  ]);

  if (!school) {
    throw new AppError('School not found.', 404);
  }

  if (!academicYear) {
    throw new AppError('Academic year not found.', 404);
  }

  const sequence = await tx.studentIdSequence.upsert({
    where: {
      schoolId_academicYearId: {
        schoolId,
        academicYearId
      }
    },
    create: {
      schoolId,
      academicYearId,
      lastNumber: 1
    },
    update: {
      lastNumber: { increment: 1 }
    }
  });

  const year = academicYear.startDate.getUTCFullYear();
  const number = String(sequence.lastNumber).padStart(6, '0');

  return `${school.schoolCode}-${year}-${number}`;
};

export const assignStudentIdentificationNumber = async (
  schoolId: string,
  studentId: string
) => {
  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findFirst({
      where: { id: studentId, schoolId },
      include: {
        admissionApplication: {
          select: { academicYearId: true }
        }
      }
    });

    if (!student) {
      throw new AppError('Student not found.', 404);
    }

    if (student.studentNumber) {
      throw new AppError(
        'Student identification number already exists.',
        409
      );
    }

    if (!student.admissionApplication) {
      throw new AppError(
        'Student admission academic year is unavailable.',
        409
      );
    }

    const studentNumber = await generateStudentNumber(
      tx,
      schoolId,
      student.admissionApplication.academicYearId
    );

    const result = await tx.student.updateMany({
      where: {
        id: studentId,
        schoolId,
        studentNumber: null
      },
      data: { studentNumber }
    });

    if (result.count !== 1) {
      throw new AppError(
        'Student identification number could not be assigned.',
        409
      );
    }

    return tx.student.findFirstOrThrow({
      where: { id: studentId, schoolId }
    });
  });
};
