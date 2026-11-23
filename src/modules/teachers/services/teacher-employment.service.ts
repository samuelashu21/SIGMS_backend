
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateTeacherEmploymentInput,
  UpdateTeacherEmploymentInput
} from '../validators/teacher-employment.validator.js';

export const createTeacherEmployment = async (
  schoolId: string,
  teacherId: string,
  input: CreateTeacherEmploymentInput
) => {
  return prisma.$transaction(async (tx) => {
    const teacher = await tx.teacherProfile.findFirst({
      where: {
        id: teacherId,
        schoolId
      },
      select: { id: true }
    });

    if (!teacher) {
      throw new AppError('Teacher profile not found.', 404);
    }

    if (input.employeeNumber) {
      const duplicate = await tx.teacherEmployment.findFirst({
        where: {
          schoolId,
          employeeNumber: input.employeeNumber
        }
      });

      if (duplicate) {
        throw new AppError(
          'Employee number already exists in this school.',
          409
        );
      }
    }

    return tx.teacherEmployment.create({
      data: {
        schoolId,
        teacherId,
        employeeNumber: input.employeeNumber,
        employmentType: input.employmentType,
        position: input.position,
        department: input.department,
        startDate: new Date(`${input.startDate}T00:00:00.000Z`),
        endDate: input.endDate
          ? new Date(`${input.endDate}T00:00:00.000Z`)
          : null,
        notes: input.notes
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true
          }
        }
      }
    });
  });
};

export const getTeacherEmploymentRecords = async (
  schoolId: string,
  teacherId: string
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

  return prisma.teacherEmployment.findMany({
    where: {
      schoolId,
      teacherId
    },
    orderBy: {
      startDate: 'desc'
    }
  });
};

export const updateTeacherEmployment = async (
  schoolId: string,
  teacherId: string,
  employmentId: string,
  input: UpdateTeacherEmploymentInput
) => {
  const employment = await prisma.teacherEmployment.findFirst({
    where: {
      id: employmentId,
      schoolId,
      teacherId
    }
  });

  if (!employment) {
    throw new AppError('Employment record not found.', 404);
  }

  if (input.employeeNumber) {
    const duplicate = await prisma.teacherEmployment.findFirst({
      where: {
        schoolId,
        employeeNumber: input.employeeNumber,
        id: { not: employmentId }
      }
    });

    if (duplicate) {
      throw new AppError(
        'Employee number already exists in this school.',
        409
      );
    }
  }

  const { endDate, ...fields } = input;

  await prisma.teacherEmployment.updateMany({
    where: {
      id: employmentId,
      schoolId,
      teacherId
    },
    data: {
      ...fields,
      ...(endDate !== undefined && {
        endDate: endDate
          ? new Date(`${endDate}T00:00:00.000Z`)
          : null
      })
    }
  });

  return prisma.teacherEmployment.findFirstOrThrow({
    where: {
      id: employmentId,
      schoolId,
      teacherId
    }
  });
};
