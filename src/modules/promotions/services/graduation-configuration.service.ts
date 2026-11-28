
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type GraduationConfigurationInput = {
  academicYearId: string;
  terminalGradeId: string;
  name: string;
  minimumOverallPercentage?: number;
  minimumGradePoint?: number;
  minimumAttendancePercentage?: number;
  minimumPassedSubjects: number;
  maximumFailedSubjects: number;
  requireCompletedExaminations: boolean;
  requireApprovedResults: boolean;
  requireAllCoreSubjectsPassed: boolean;
};

export const createGraduationConfiguration = async (
  schoolId: string,
  createdById: string,
  input: GraduationConfigurationInput
) => {
  return prisma.$transaction(async (tx) => {
    const [academicYear, grade, progression] = await Promise.all([
      tx.academicYear.findFirst({
        where: { id: input.academicYearId, schoolId },
        select: { id: true }
      }),
      tx.grade.findFirst({
        where: { id: input.terminalGradeId, schoolId },
        select: { id: true }
      }),
      tx.gradeProgressionRule.findFirst({
        where: {
          schoolId,
          academicYearId: input.academicYearId,
          currentGradeId: input.terminalGradeId,
          isActive: true,
          isGraduationGrade: true,
          nextGradeId: null
        },
        select: { id: true }
      })
    ]);

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }

    if (!grade) {
      throw new AppError('Terminal grade not found.', 404);
    }

    if (!progression) {
      throw new AppError(
        'The selected grade is not configured as a graduation grade.',
        409
      );
    }

    return tx.graduationConfiguration.create({
      data: {
        schoolId,
        academicYearId: input.academicYearId,
        terminalGradeId: input.terminalGradeId,
        name: input.name,
        minimumOverallPercentage: input.minimumOverallPercentage,
        minimumGradePoint: input.minimumGradePoint,
        minimumAttendancePercentage:
          input.minimumAttendancePercentage,
        minimumPassedSubjects: input.minimumPassedSubjects,
        maximumFailedSubjects: input.maximumFailedSubjects,
        requireCompletedExaminations:
          input.requireCompletedExaminations,
        requireApprovedResults: input.requireApprovedResults,
        requireAllCoreSubjectsPassed:
          input.requireAllCoreSubjectsPassed,
        createdById
      },
      include: {
        academicYear: true,
        terminalGrade: true
      }
    });
  });
};

export const getGraduationConfigurations = async (
  schoolId: string,
  academicYearId?: string
) => {
  return prisma.graduationConfiguration.findMany({
    where: {
      schoolId,
      ...(academicYearId ? { academicYearId } : {})
    },
    include: {
      academicYear: true,
      terminalGrade: true
    },
    orderBy: { createdAt: 'desc' }
  });
};
