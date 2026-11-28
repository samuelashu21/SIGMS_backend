
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type CreateRequirementInput = {
  academicYearId: string;
  gradeId: string;
  subjectId: string;
  requiredPeriodsPerWeek: number;
  maximumPeriodsPerDay: number;
  allowConsecutivePeriods: boolean;
};

export const createSubjectSchedulingRequirement = async (
  schoolId: string,
  input: CreateRequirementInput
) => {
  return prisma.$transaction(async (tx) => {
    const [academicYear, grade, subject, gradeSubject] =
      await Promise.all([
        tx.academicYear.findFirst({
          where: { id: input.academicYearId, schoolId }
        }),
        tx.grade.findFirst({
          where: { id: input.gradeId, schoolId }
        }),
        tx.subject.findFirst({
          where: { id: input.subjectId, schoolId }
        }),
        tx.gradeSubject.findFirst({
          where: {
            schoolId,
            gradeId: input.gradeId,
            subjectId: input.subjectId
          }
        })
      ]);

    if (!academicYear || !grade || !subject || !gradeSubject) {
      throw new AppError(
        'Academic year, grade, subject, or grade-subject assignment not found.',
        404
      );
    }

    const existing = await tx.subjectSchedulingRequirement.findFirst({
      where: {
        schoolId,
        academicYearId: input.academicYearId,
        gradeId: input.gradeId,
        subjectId: input.subjectId
      }
    });

    if (existing) {
      throw new AppError(
        'A scheduling requirement already exists for this subject and grade.',
        409
      );
    }

    return tx.subjectSchedulingRequirement.create({
      data: {
        schoolId,
        ...input
      },
      include: {
        academicYear: true,
        grade: true,
        subject: true
      }
    });
  });
};

export const listSubjectSchedulingRequirements = async (
  schoolId: string,
  academicYearId: string,
  gradeId?: string
) => {
  return prisma.subjectSchedulingRequirement.findMany({
    where: {
      schoolId,
      academicYearId,
      ...(gradeId ? { gradeId } : {})
    },
    include: {
      grade: true,
      subject: true
    },
    orderBy: [
      { gradeId: 'asc' },
      { subjectId: 'asc' }
    ]
  });
};

export const updateSubjectSchedulingRequirement = async (
  schoolId: string,
  requirementId: string,
  input: {
    requiredPeriodsPerWeek?: number;
    maximumPeriodsPerDay?: number;
    allowConsecutivePeriods?: boolean;
    isActive?: boolean;
  }
) => {
  const existing =
    await prisma.subjectSchedulingRequirement.findFirst({
      where: {
        id: requirementId,
        schoolId
      }
    });

  if (!existing) {
    throw new AppError(
      'Subject scheduling requirement not found.',
      404
    );
  }

  return prisma.subjectSchedulingRequirement.update({
    where: { id: requirementId },
    data: input,
    include: {
      academicYear: true,
      grade: true,
      subject: true
    }
  });
};

/**
 * Validates the subject frequency and daily distribution
 * for a proposed class timetable.
 */
export const validateSubjectSchedule = async (
  schoolId: string,
  academicYearId: string,
  gradeId: string,
  entries: {
    day: string;
    periodId: string;
    subjectId: string;
  }[],
  periods: {
    id: string;
    periodNumber: number;
  }[]
) => {
  const requirements =
    await prisma.subjectSchedulingRequirement.findMany({
      where: {
        schoolId,
        academicYearId,
        gradeId,
        isActive: true
      }
    });

  const periodNumbers = new Map(
    periods.map((period) => [period.id, period.periodNumber])
  );

  for (const requirement of requirements) {
    const subjectEntries = entries.filter(
      (entry) => entry.subjectId === requirement.subjectId
    );

    if (
      subjectEntries.length !== requirement.requiredPeriodsPerWeek
    ) {
      throw new AppError(
        `Subject ${requirement.subjectId} requires ${requirement.requiredPeriodsPerWeek} periods per week.`,
        400
      );
    }

    const dailyEntries = new Map<string, typeof subjectEntries>();

    for (const entry of subjectEntries) {
      const existing = dailyEntries.get(entry.day) ?? [];
      existing.push(entry);
      dailyEntries.set(entry.day, existing);
    }

    for (const [day, dayEntries] of dailyEntries) {
      if (dayEntries.length > requirement.maximumPeriodsPerDay) {
        throw new AppError(
          `Subject ${requirement.subjectId} exceeds its daily period limit on ${day}.`,
          400
        );
      }

      if (!requirement.allowConsecutivePeriods) {
        const numbers = dayEntries
          .map((entry) => periodNumbers.get(entry.periodId))
          .filter((value): value is number => value !== undefined)
          .sort((a, b) => a - b);

        for (let index = 1; index < numbers.length; index++) {
          if (numbers[index] === numbers[index - 1] + 1) {
            throw new AppError(
              `Consecutive periods are not allowed for subject ${requirement.subjectId} on ${day}.`,
              400
            );
          }
        }
      }
    }
  }

  return true;
};
