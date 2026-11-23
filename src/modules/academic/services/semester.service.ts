
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateSemesterInput,
  UpdateSemesterInput
} from '../validators/semester.validator.js';

const dateString = (date: Date) => date.toISOString().slice(0, 10);

const getAcademicYearForSchool = async (
  schoolId: string,
  academicYearId: string
) => {
  const year = await prisma.academicYear.findFirst({
    where: { id: academicYearId, schoolId }
  });

  if (!year) throw new AppError('Academic year not found.', 404);
  return year;
};

export const createSemester = async (
  schoolId: string,
  input: CreateSemesterInput
) => {
  const year = await getAcademicYearForSchool(
    schoolId,
    input.academicYearId
  );

  if (
    input.startDate < dateString(year.startDate) ||
    input.endDate > dateString(year.endDate)
  ) {
    throw new AppError(
      'Semester dates must fall within the academic year.',
      400
    );
  }

  return prisma.semester.create({
    data: {
      schoolId,
      academicYearId: input.academicYearId,
      name: input.name,
      sequence: input.sequence,
      startDate: new Date(`${input.startDate}T00:00:00.000Z`),
      endDate: new Date(`${input.endDate}T00:00:00.000Z`)
    }
  });
};

export const getSemesters = async (
  schoolId: string,
  academicYearId: string
) => {
  await getAcademicYearForSchool(schoolId, academicYearId);

  return prisma.semester.findMany({
    where: { schoolId, academicYearId },
    orderBy: { sequence: 'asc' }
  });
};

export const updateSemester = async (
  schoolId: string,
  semesterId: string,
  input: UpdateSemesterInput
) => {
  const semester = await prisma.semester.findFirst({
    where: { id: semesterId, schoolId },
    include: { academicYear: true }
  });

  if (!semester) throw new AppError('Semester not found.', 404);

  const startDate = input.startDate
    ? new Date(`${input.startDate}T00:00:00.000Z`)
    : semester.startDate;

  const endDate = input.endDate
    ? new Date(`${input.endDate}T00:00:00.000Z`)
    : semester.endDate;

  if (startDate >= endDate) {
    throw new AppError('Semester end date must be after start date.', 400);
  }

  if (
    dateString(startDate) < dateString(semester.academicYear.startDate) ||
    dateString(endDate) > dateString(semester.academicYear.endDate)
  ) {
    throw new AppError(
      'Semester dates must fall within the academic year.',
      400
    );
  }

  return prisma.semester.update({
    where: { id: semesterId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.sequence !== undefined && { sequence: input.sequence }),
      ...(input.startDate && { startDate }),
      ...(input.endDate && { endDate })
    }
  });
};

export const setCurrentSemester = async (
  schoolId: string,
  semesterId: string
) => {
  const semester = await prisma.semester.findFirst({
    where: { id: semesterId, schoolId },
    include: { academicYear: true }
  });

  if (!semester) throw new AppError('Semester not found.', 404);

  if (semester.academicYear.status !== 'ACTIVE') {
    throw new AppError(
      'The semester academic year must be active first.',
      400
    );
  }

  if (semester.status === 'COMPLETED') {
    throw new AppError('A completed semester cannot be activated.', 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.semester.updateMany({
      where: {
        schoolId,
        academicYearId: semester.academicYearId,
        isCurrent: true
      },
      data: {
        isCurrent: false,
        status: 'PLANNED'
      }
    });

    return tx.semester.update({
      where: { id: semesterId },
      data: {
        isCurrent: true,
        status: 'ACTIVE'
      }
    });
  });
};
