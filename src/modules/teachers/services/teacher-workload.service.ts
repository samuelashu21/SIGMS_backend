
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  z
} from 'zod';

import {
  createTeacherWorkloadSchema,
  updateTeacherWorkloadSchema
} from '../validators/teacher-workload.validator.js';

type CreateWorkloadInput = z.infer<
  typeof createTeacherWorkloadSchema
>;

type UpdateWorkloadInput = z.infer<
  typeof updateTeacherWorkloadSchema
>;

export const createTeacherWorkload = async (
  schoolId: string,
  teacherId: string,
  input: CreateWorkloadInput
) => {
  const teacher = await prisma.teacherProfile.findFirst({
    where: {
      id: teacherId,
      schoolId,
      isActive: true
    },
    select: { id: true }
  });

  if (!teacher) {
    throw new AppError('Active teacher profile not found.', 404);
  }

  const academicYear = await prisma.academicYear.findFirst({
    where: {
      id: input.academicYearId,
      schoolId
    },
    select: { id: true }
  });

  if (!academicYear) {
    throw new AppError('Academic year not found.', 404);
  }

  return prisma.teacherWorkloadRecord.create({
    data: {
      schoolId,
      teacherId,
      academicYearId: input.academicYearId,
      workloadType: input.workloadType,
      description: input.description,
      weeklyPeriods: input.weeklyPeriods,
      effectiveFrom: new Date(
        `${input.effectiveFrom}T00:00:00.000Z`
      ),
      effectiveTo: input.effectiveTo
        ? new Date(`${input.effectiveTo}T00:00:00.000Z`)
        : null
    },
    include: {
      teacher: true,
      academicYear: true
    }
  });
};

export const getTeacherWorkloadRecords = async (
  schoolId: string,
  teacherId: string,
  academicYearId?: string
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

  return prisma.teacherWorkloadRecord.findMany({
    where: {
      schoolId,
      teacherId,
      ...(academicYearId && { academicYearId })
    },
    include: {
      academicYear: true
    },
    orderBy: [
      { effectiveFrom: 'desc' },
      { createdAt: 'desc' }
    ]
  });
};

export const updateTeacherWorkload = async (
  schoolId: string,
  teacherId: string,
  workloadId: string,
  input: UpdateWorkloadInput
) => {
  const record = await prisma.teacherWorkloadRecord.findFirst({
    where: {
      id: workloadId,
      schoolId,
      teacherId
    }
  });

  if (!record) {
    throw new AppError('Teacher workload record not found.', 404);
  }

  if (
    input.effectiveTo &&
    input.effectiveTo <
      record.effectiveFrom.toISOString().slice(0, 10)
  ) {
    throw new AppError(
      'Effective end date cannot precede start date.',
      400
    );
  }

  const { effectiveTo, ...fields } = input;

  return prisma.teacherWorkloadRecord.update({
    where: {
      id: workloadId
    },
    data: {
      ...fields,
      ...(effectiveTo !== undefined && {
        effectiveTo: effectiveTo
          ? new Date(`${effectiveTo}T00:00:00.000Z`)
          : null
      })
    },
    include: {
      teacher: true,
      academicYear: true
    }
  });
};

export const getTeacherWorkloadSummary = async (
  schoolId: string,
  teacherId: string,
  academicYearId: string
) => {
  const records = await prisma.teacherWorkloadRecord.findMany({
    where: {
      schoolId,
      teacherId,
      academicYearId,
      isActive: true
    },
    select: {
      workloadType: true,
      weeklyPeriods: true
    }
  });

  const summary = {
    totalWeeklyPeriods: 0,
    teachingPeriods: 0,
    homeroomPeriods: 0,
    administrativePeriods: 0,
    extracurricularPeriods: 0,
    otherPeriods: 0
  };

  for (const record of records) {
    summary.totalWeeklyPeriods += record.weeklyPeriods;

    switch (record.workloadType) {
      case 'TEACHING':
        summary.teachingPeriods += record.weeklyPeriods;
        break;
      case 'HOMEROOM':
        summary.homeroomPeriods += record.weeklyPeriods;
        break;
      case 'ADMINISTRATIVE':
        summary.administrativePeriods += record.weeklyPeriods;
        break;
      case 'EXTRACURRICULAR':
        summary.extracurricularPeriods += record.weeklyPeriods;
        break;
      case 'OTHER':
        summary.otherPeriods += record.weeklyPeriods;
        break;
    }
  }

  return {
    teacherId,
    academicYearId,
    ...summary
  };
};
