
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateSectionInput,
  UpdateSectionInput
} from '../validators/section.validator.js';

export const createSection = async (
  schoolId: string,
  input: CreateSectionInput
) => {
  const [grade, academicYear] = await Promise.all([
    prisma.grade.findFirst({
      where: {
        id: input.gradeId,
        schoolId,
        isActive: true
      }
    }),
    prisma.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      }
    })
  ]);

  if (!grade) throw new AppError('Active grade not found.', 404);
  if (!academicYear) throw new AppError('Academic year not found.', 404);

  const existing = await prisma.section.findFirst({
    where: {
      schoolId,
      gradeId: input.gradeId,
      academicYearId: input.academicYearId,
      name: input.name
    }
  });

  if (existing) {
    throw new AppError('Section already exists for this grade and year.', 409);
  }

  return prisma.section.create({
    data: {
      schoolId,
      gradeId: input.gradeId,
      academicYearId: input.academicYearId,
      name: input.name,
      capacity: input.capacity,
      room: input.room
    },
    include: {
      grade: true,
      academicYear: true
    }
  });
};

export const getSections = async (
  schoolId: string,
  filters: {
    gradeId?: string;
    academicYearId?: string;
    isActive?: boolean;
  } = {}
) => {
  return prisma.section.findMany({
    where: {
      schoolId,
      ...(filters.gradeId && { gradeId: filters.gradeId }),
      ...(filters.academicYearId && {
        academicYearId: filters.academicYearId
      }),
      ...(filters.isActive !== undefined && {
        isActive: filters.isActive
      })
    },
    include: {
      grade: true,
      academicYear: true
    },
    orderBy: [
      { grade: { gradeLevel: 'asc' } },
      { name: 'asc' }
    ]
  });
};

export const getSection = async (
  schoolId: string,
  sectionId: string
) => {
  const section = await prisma.section.findFirst({
    where: { id: sectionId, schoolId },
    include: {
      grade: true,
      academicYear: true
    }
  });

  if (!section) throw new AppError('Section not found.', 404);

  return section;
};

export const updateSection = async (
  schoolId: string,
  sectionId: string,
  input: UpdateSectionInput
) => {
  const section = await getSection(schoolId, sectionId);

  const name = input.name ?? section.name;

  const duplicate = await prisma.section.findFirst({
    where: {
      schoolId,
      academicYearId: section.academicYearId,
      gradeId: section.gradeId,
      name,
      id: { not: sectionId }
    }
  });

  if (duplicate) {
    throw new AppError('Section name already exists for this grade and year.', 409);
  }

  return prisma.section.update({
    where: { id: sectionId },
    data: input,
    include: {
      grade: true,
      academicYear: true
    }
  });
};
