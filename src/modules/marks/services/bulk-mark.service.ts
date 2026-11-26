
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type BulkMarkInput = {
  examinationId: string;
  records: {
    studentId: string;
    obtainedMarks: number;
    bonusMarks: number;
    penaltyMarks: number;
    remarks?: string;
  }[];
};

export const createBulkMarkEntries = async (
  schoolId: string,
  enteredById: string,
  input: BulkMarkInput
) => {
  return prisma.$transaction(async (tx) => {
    const examination = await tx.examination.findFirst({
      where: {
        id: input.examinationId,
        schoolId
      },
      include: {
        gradingConfiguration: true
      }
    });

    if (!examination) {
      throw new AppError('Examination not found.', 404);
    }

    if (
      examination.status !== 'ONGOING' &&
      examination.status !== 'COMPLETED'
    ) {
      throw new AppError(
        'Bulk marks can only be entered for ongoing or completed examinations.',
        409
      );
    }

    const grading = examination.gradingConfiguration;

    const maximumMarks = grading
      ? Number(grading.maximumMarks)
      : Number(examination.totalMarks);

    const allowBonusMarks = grading?.allowBonusMarks ?? false;
    const allowNegativeMarks = grading?.allowNegativeMarks ?? false;

    const studentIds = input.records.map(
      (record) => record.studentId
    );

    const students = await tx.student.findMany({
      where: {
        schoolId,
        id: { in: studentIds },
        isActive: true
      },
      select: {
        id: true
      }
    });

    if (students.length !== studentIds.length) {
      throw new AppError(
        'One or more students are missing, inactive, or belong to another school.',
        400
      );
    }

    const enrollments = await tx.academicEnrollment.findMany({
      where: {
        schoolId,
        studentId: { in: studentIds },
        academicYearId: examination.academicYearId,
        gradeId: examination.gradeId,
        ...(examination.sectionId && {
          sectionId: examination.sectionId
        }),
        status: 'ACTIVE'
      },
      select: {
        studentId: true
      }
    });

    const enrolledStudentIds = new Set(
      enrollments.map((item) => item.studentId)
    );

    const unenrolledStudents = studentIds.filter(
      (studentId) => !enrolledStudentIds.has(studentId)
    );

    if (unenrolledStudents.length > 0) {
      throw new AppError(
        `Some students are not actively enrolled in this examination: ${unenrolledStudents.join(', ')}`,
        400
      );
    }

    for (const record of input.records) {
      if (record.obtainedMarks > maximumMarks) {
        throw new AppError(
          `Obtained marks exceed the maximum for student ${record.studentId}.`,
          400
        );
      }

      if (!allowBonusMarks && record.bonusMarks > 0) {
        throw new AppError(
          `Bonus marks are not permitted for student ${record.studentId}.`,
          400
        );
      }

      if (!allowNegativeMarks && record.penaltyMarks > 0) {
        throw new AppError(
          `Penalty marks are not permitted for student ${record.studentId}.`,
          400
        );
      }
    }

    const existingRecords = await tx.markRecord.findMany({
      where: {
        schoolId,
        examinationId: input.examinationId,
        studentId: { in: studentIds }
      }
    });

    const existingByStudent = new Map(
      existingRecords.map((record) => [
        record.studentId,
        record
      ])
    );

    for (const record of existingRecords) {
      if (
        record.status !== 'DRAFT' &&
        record.status !== 'REJECTED'
      ) {
        throw new AppError(
          `Marks for student ${record.studentId} cannot be changed because their record is ${record.status}.`,
          409
        );
      }
    }

    const results = [];

    for (const record of input.records) {
      const existing = existingByStudent.get(record.studentId);

      const data = {
        enteredById,
        obtainedMarks: record.obtainedMarks,
        bonusMarks: record.bonusMarks,
        penaltyMarks: record.penaltyMarks,
        remarks: record.remarks,
        status: 'DRAFT' as const
      };

      const saved = existing
        ? await tx.markRecord.update({
            where: { id: existing.id },
            data,
            include: {
              student: true
            }
          })
        : await tx.markRecord.create({
            data: {
              schoolId,
              examinationId: input.examinationId,
              studentId: record.studentId,
              ...data
            },
            include: {
              student: true
            }
          });

      results.push(saved);
    }

    return {
      examinationId: input.examinationId,
      totalProcessed: results.length,
      createdOrUpdated: results.length,
      records: results
    };
  });
};
