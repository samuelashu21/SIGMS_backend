
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const createSubjectWeight = async (
  schoolId: string,
  input: {
    academicYearId: string;
    gradeId: string;
    subjectId: string;
    weight: number;
  }
) => {
  const [year, grade, subject] = await Promise.all([
    prisma.academicYear.findFirst({
      where: { id: input.academicYearId, schoolId },
      select: { id: true }
    }),
    prisma.grade.findFirst({
      where: { id: input.gradeId, schoolId },
      select: { id: true }
    }),
    prisma.subject.findFirst({
      where: { id: input.subjectId, schoolId },
      select: { id: true }
    })
  ]);

  if (!year || !grade || !subject) {
    throw new AppError(
      'Academic year, grade or subject not found in this school.',
      404
    );
  }

  return prisma.academicSubjectWeight.upsert({
    where: {
      schoolId_academicYearId_gradeId_subjectId: {
        schoolId,
        academicYearId: input.academicYearId,
        gradeId: input.gradeId,
        subjectId: input.subjectId
      }
    },
    create: {
      schoolId,
      ...input
    },
    update: {
      weight: input.weight,
      isActive: true
    }
  });
};

export const createSemesterWeight = async (
  schoolId: string,
  input: {
    academicYearId: string;
    semesterId: string;
    weight: number;
  }
) => {
  const semester = await prisma.semester.findFirst({
    where: {
      id: input.semesterId,
      schoolId,
      academicYearId: input.academicYearId
    },
    select: { id: true }
  });

  if (!semester) {
    throw new AppError(
      'Semester does not belong to the selected academic year.',
      404
    );
  }

  return prisma.academicSemesterWeight.upsert({
    where: {
      schoolId_academicYearId_semesterId: {
        schoolId,
        academicYearId: input.academicYearId,
        semesterId: input.semesterId
      }
    },
    create: {
      schoolId,
      ...input
    },
    update: {
      weight: input.weight,
      isActive: true
    }
  });
};

export const getSubjectWeights = async (
  schoolId: string,
  academicYearId: string,
  gradeId: string
) => {
  return prisma.academicSubjectWeight.findMany({
    where: {
      schoolId,
      academicYearId,
      gradeId,
      isActive: true
    },
    include: {
      subject: true
    },
    orderBy: {
      subject: { name: 'asc' }
    }
  });
};

export const getSemesterWeights = async (
  schoolId: string,
  academicYearId: string
) => {
  return prisma.academicSemesterWeight.findMany({
    where: {
      schoolId,
      academicYearId,
      isActive: true
    },
    include: {
      semester: true
    },
    orderBy: {
      semester: { startDate: 'asc' }
    }
  });
};

export const updateSubjectWeight = async (
  schoolId: string,
  weightId: string,
  input: { weight?: number; isActive?: boolean }
) => {
  const existing = await prisma.academicSubjectWeight.findFirst({
    where: { id: weightId, schoolId }
  });

  if (!existing) {
    throw new AppError('Subject weight not found.', 404);
  }

  return prisma.academicSubjectWeight.update({
    where: { id: existing.id },
    data: input
  });
};

export const updateSemesterWeight = async (
  schoolId: string,
  weightId: string,
  input: { weight?: number; isActive?: boolean }
) => {
  const existing = await prisma.academicSemesterWeight.findFirst({
    where: { id: weightId, schoolId }
  });

  if (!existing) {
    throw new AppError('Semester weight not found.', 404);
  }

  return prisma.academicSemesterWeight.update({
    where: { id: existing.id },
    data: input
  });
};
