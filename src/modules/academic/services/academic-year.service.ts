
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateAcademicYearInput,
  UpdateAcademicYearInput
} from '../validators/academic-year.validator.js';

/**
 * Create an academic year.
 */
export const createAcademicYear = async (
  schoolId: string,
  input: CreateAcademicYearInput
) => {
  const existing = await prisma.academicYear.findUnique({
    where: {
      schoolId_name: {
        schoolId,
        name: input.name
      }
    }
  });

  if (existing) {
    throw new AppError('Academic year already exists.', 409);
  }

  return prisma.academicYear.create({
    data: {
      schoolId,
      ...input,
      startDate: new Date(`${input.startDate}T00:00:00.000Z`),
      endDate: new Date(`${input.endDate}T00:00:00.000Z`)
    }
  });
};

/**
 * Retrieve all academic years belonging to a school.
 */
export const getAcademicYears = (schoolId: string) => {
  return prisma.academicYear.findMany({
    where: { schoolId },
    include: {
      _count: { select: { semesters: true } }
    },
    orderBy: { startDate: 'desc' }
  });
};

/**
 * Retrieve a specific academic year and its semesters.
 */
export const getAcademicYear = async (
  schoolId: string,
  academicYearId: string
) => {
  const academicYear = await prisma.academicYear.findFirst({
    where: {
      id: academicYearId,
      schoolId
    },
    include: { semesters: true }
  });

  if (!academicYear) {
    throw new AppError('Academic year not found.', 404);
  }

  return academicYear;
};

/**
 * Update an academic year.
 */
export const updateAcademicYear = async (
  schoolId: string,
  academicYearId: string,
  input: UpdateAcademicYearInput
) => {
  const existing = await getAcademicYear(schoolId, academicYearId);

  const startDate = input.startDate
    ? new Date(`${input.startDate}T00:00:00.000Z`)
    : existing.startDate;

  const endDate = input.endDate
    ? new Date(`${input.endDate}T00:00:00.000Z`)
    : existing.endDate;

  if (startDate >= endDate) {
    throw new AppError('End date must be after start date.', 400);
  }

  if (input.name && input.name !== existing.name) {
    const duplicate = await prisma.academicYear.findUnique({
      where: {
        schoolId_name: {
          schoolId,
          name: input.name
        }
      }
    });

    if (duplicate) {
      throw new AppError('Academic year name already exists.', 409);
    }
  }

  return prisma.academicYear.update({
    where: { id: academicYearId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.startDate && { startDate }),
      ...(input.endDate && { endDate })
    }
  });
};

/**
 * Set an academic year as the current academic year.
 *
 * Also clears any previously active semester belonging
 * to the school to maintain academic period consistency.
 */
export const setCurrentAcademicYear = async (
  schoolId: string,
  academicYearId: string
) => {
  const year = await getAcademicYear(schoolId, academicYearId);

  if (year.status === 'COMPLETED') {
    throw new AppError(
      'A completed academic year cannot be activated.',
      400
    );
  }

  return prisma.$transaction(async (tx) => {
    // Deactivate the previous current academic year.
    await tx.academicYear.updateMany({
      where: {
        schoolId,
        isCurrent: true
      },
      data: {
        isCurrent: false,
        status: 'PLANNED'
      }
    });

    // Deactivate the previous current semester.
    await tx.semester.updateMany({
      where: {
        schoolId,
        isCurrent: true
      },
      data: {
        isCurrent: false,
        status: 'PLANNED'
      }
    });

    // Activate the selected academic year.
    return tx.academicYear.update({
      where: { id: academicYearId },
      data: {
        isCurrent: true,
        status: 'ACTIVE'
      }
    });
  });
};
