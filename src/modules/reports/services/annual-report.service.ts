
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';
import { generateStudentReportCard } from './report-card.service.js';

type GenerateAnnualReportInput = {
  studentId: string;
  enrollmentId: string;
  academicYearId: string;
};

export const generateAnnualReport = async (
  schoolId: string,
  createdById: string,
  input: GenerateAnnualReportInput
) => {
  const enrollment = await prisma.academicEnrollment.findFirst({
    where: {
      id: input.enrollmentId,
      schoolId,
      studentId: input.studentId,
      academicYearId: input.academicYearId,
      status: { in: ['ACTIVE', 'COMPLETED'] }
    },
    select: { id: true }
  });

  if (!enrollment) {
    throw new AppError('Student enrollment not found.', 404);
  }

  const annualAverage =
    await prisma.annualAcademicAverage.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId
      }
    });

  if (!annualAverage) {
    throw new AppError(
      'Calculate the annual average before generating the report.',
      409
    );
  }

  return generateStudentReportCard(
    schoolId,
    createdById,
    {
      ...input,
      periodType: 'ANNUAL'
    }
  );
};

export const getAnnualReports = async (
  schoolId: string,
  filters: {
    studentId?: string;
    academicYearId?: string;
    page: number;
    limit: number;
  }
) => {
  const where = {
    schoolId,
    periodType: 'ANNUAL' as const,
    semesterId: null,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.academicYearId && {
      academicYearId: filters.academicYearId
    })
  };

  const [reports, total] = await prisma.$transaction([
    prisma.reportCard.findMany({
      where,
      include: {
        student: true,
        academicYear: true,
        grade: true,
        section: true,
        subjects: true,
        attendance: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.reportCard.count({ where })
  ]);

  return {
    reports,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};
