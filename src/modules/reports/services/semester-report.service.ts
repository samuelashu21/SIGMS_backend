
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';
import { generateStudentReportCard } from './report-card.service.js';

type GenerateSemesterReportInput = {
  studentId: string;
  enrollmentId: string;
  academicYearId: string;
  semesterId: string;
};

export const generateSemesterReport = async (
  schoolId: string,
  createdById: string,
  input: GenerateSemesterReportInput
) => {
  const semester = await prisma.semester.findFirst({
    where: {
      id: input.semesterId,
      schoolId,
      academicYearId: input.academicYearId
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true
    }
  });

  if (!semester) {
    throw new AppError('Semester not found.', 404);
  }

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

  const semesterAverage =
    await prisma.semesterAcademicAverage.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.academicYearId,
        semesterId: input.semesterId
      }
    });

  if (!semesterAverage) {
    throw new AppError(
      'Calculate the semester average before generating the report.',
      409
    );
  }

  return generateStudentReportCard(
    schoolId,
    createdById,
    {
      ...input,
      periodType: 'SEMESTER'
    }
  );
};



export const getSemesterReports = async (
  schoolId: string,
  filters: {
    studentId?: string;
    academicYearId?: string;
    semesterId?: string;
    page: number;
    limit: number;
  }
) => {
  const where = {
    schoolId,
    periodType: 'SEMESTER' as const,
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.academicYearId && {
      academicYearId: filters.academicYearId
    }),
    ...(filters.semesterId && {
      semesterId: filters.semesterId
    })
  };

  const [reports, total] = await prisma.$transaction([
    prisma.reportCard.findMany({
      where,
      include: {
        student: true,
        academicYear: true,
        semester: true,
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
