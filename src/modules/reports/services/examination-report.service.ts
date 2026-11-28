
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type ExaminationReportInput = {
  examinationId: string;
  scope: 'EXAMINATION' | 'STUDENT' | 'SECTION' | 'SUBJECT';
  studentId?: string;
  sectionId?: string;
  subjectId?: string;
};

export const generateExaminationReport = async (
  schoolId: string,
  generatedById: string,
  input: ExaminationReportInput
) => {
  return prisma.$transaction(async (tx) => {
    const examination = await tx.examination.findFirst({
      where: {
        id: input.examinationId,
        schoolId
      },
      select: {
        id: true,
        name: true,
        totalMarks: true,
        passingMarks: true,
        gradeId: true,
        sectionId: true,
        subjectId: true,
        status: true
      }
    });

    if (!examination) {
      throw new AppError('Examination not found.', 404);
    }

    if (examination.status !== 'COMPLETED') {
      throw new AppError(
        'Examination reports can only be generated for completed examinations.',
        409
      );
    }

    if (
      input.scope === 'STUDENT' &&
      !(await tx.student.findFirst({
        where: { id: input.studentId, schoolId },
        select: { id: true }
      }))
    ) {
      throw new AppError('Student not found.', 404);
    }

    if (
      input.scope === 'SECTION' &&
      !(await tx.section.findFirst({
        where: {
          id: input.sectionId,
          schoolId,
          gradeId: examination.gradeId
        },
        select: { id: true }
      }))
    ) {
      throw new AppError('Section not found for this examination.', 404);
    }

    if (
      input.scope === 'SUBJECT' &&
      input.subjectId !== examination.subjectId
    ) {
      throw new AppError(
        'Subject does not belong to this examination.',
        400
      );
    }

    const marks = await tx.markRecord.findMany({
      where: {
        schoolId,
        examinationId: examination.id,
        status: 'PUBLISHED',
        ...(input.studentId && { studentId: input.studentId })
      },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            fullName: true
          }
        }
      }
    });

    const totalStudents = marks.length;

    const values = marks.map((mark) =>
      Number(mark.obtainedMarks) +
      Number(mark.bonusMarks) -
      Number(mark.penaltyMarks)
    );

    const averageMarks = totalStudents
      ? values.reduce((sum, value) => sum + value, 0) / totalStudents
      : null;

    const highestMarks = totalStudents
      ? Math.max(...values)
      : null;

    const lowestMarks = totalStudents
      ? Math.min(...values)
      : null;

    const passingMarks = Number(examination.passingMarks ?? 0);

    const passCount = values.filter(
      (value) => value >= passingMarks
    ).length;

    const failCount = totalStudents - passCount;

    const passPercentage = totalStudents
      ? (passCount / totalStudents) * 100
      : null;

    const details = marks.map((mark, index) => ({
      studentId: mark.student.id,
      studentNumber: mark.student.studentNumber,
      studentName: mark.student.fullName,
      obtainedMarks: Number(mark.obtainedMarks),
      bonusMarks: Number(mark.bonusMarks),
      penaltyMarks: Number(mark.penaltyMarks),
      finalMarks: values[index],
      percentage:
        (values[index] / Number(examination.totalMarks)) * 100,
      passed: values[index] >= passingMarks
    }));

    const reportNumber =
      `EXR-${Date.now()}-${input.scope}`;

    return tx.examinationReport.create({
      data: {
        schoolId,
        examinationId: examination.id,
        studentId: input.studentId ?? null,
        sectionId: input.sectionId ?? null,
        subjectId: input.subjectId ?? null,
        reportNumber,
        scope: input.scope,
        totalStudents,
        submittedMarks: totalStudents,
        approvedMarks: totalStudents,
        averageMarks,
        highestMarks,
        lowestMarks,
        passCount,
        failCount,
        passPercentage,
        reportDetails: {
          examinationName: examination.name,
          totalMarks: Number(examination.totalMarks),
          passingMarks,
          students: details
        },
        generatedById
      }
    });
  });
};

export const getExaminationReports = async (
  schoolId: string,
  filters: {
    examinationId?: string;
    studentId?: string;
    sectionId?: string;
    page: number;
    limit: number;
  }
) => {
  const where = {
    schoolId,
    ...(filters.examinationId && {
      examinationId: filters.examinationId
    }),
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.sectionId && { sectionId: filters.sectionId })
  };

  const [records, total] = await prisma.$transaction([
    prisma.examinationReport.findMany({
      where,
      include: {
        examination: true,
        student: true,
        section: true,
        subject: true,
        generatedBy: {
          select: { id: true, username: true }
        }
      },
      orderBy: { generatedAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.examinationReport.count({ where })
  ]);

  return {
    records,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};
