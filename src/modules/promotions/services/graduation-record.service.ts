
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';
import {
  recordAcademicProgression
} from './academic-progression-history.service.js';

type CreateGraduationRecordInput = {
  candidateId: string;
  graduationDate: Date;
  graduationNumber: string;
  qualification?: string;
  distinction?: string;
  remarks?: string;
};

export const createGraduationRecord = async (
  schoolId: string,
  approvedById: string,
  input: CreateGraduationRecordInput
) => {
  return prisma.$transaction(async (tx) => {
    const candidate = await tx.graduationCandidate.findFirst({
      where: {
        id: input.candidateId,
        schoolId
      },
      include: {
        enrollment: true,
        configuration: true
      }
    });

    if (!candidate) {
      throw new AppError('Graduation candidate not found.', 404);
    }

    if (candidate.status !== 'APPROVED') {
      throw new AppError(
        'Only approved graduation candidates can receive graduation records.',
        409
      );
    }

    if (candidate.configuration.status !== 'ACTIVE') {
      throw new AppError(
        'The graduation configuration is not active.',
        409
      );
    }

    if (
      candidate.enrollment.status !== 'ACTIVE' &&
      candidate.enrollment.status !== 'COMPLETED'
    ) {
      throw new AppError(
        'The student enrollment cannot be graduated.',
        409
      );
    }

    const progression = await tx.gradeProgressionRule.findFirst({
      where: {
        schoolId,
        academicYearId: candidate.academicYearId,
        currentGradeId: candidate.enrollment.gradeId,
        isActive: true,
        isGraduationGrade: true,
        nextGradeId: null
      }
    });

    if (!progression) {
      throw new AppError(
        'The student grade is not configured as a graduation grade.',
        409
      );
    }

    const existing = await tx.graduationRecord.findFirst({
      where: {
        schoolId,
        studentId: candidate.studentId,
        academicYearId: candidate.academicYearId
      }
    });

    if (existing) {
      throw new AppError(
        'A graduation record already exists for this student and academic year.',
        409
      );
    }

    const duplicateNumber = await tx.graduationRecord.findFirst({
      where: {
        schoolId,
        graduationNumber: input.graduationNumber
      }
    });

    if (duplicateNumber) {
      throw new AppError(
        'Graduation number already exists in this school.',
        409
      );
    }

    const record = await tx.graduationRecord.create({
      data: {
        schoolId,
        studentId: candidate.studentId,
        enrollmentId: candidate.enrollmentId,
        candidateId: candidate.id,
        academicYearId: candidate.academicYearId,
        terminalGradeId: candidate.enrollment.gradeId,
        graduationNumber: input.graduationNumber,
        graduationDate: input.graduationDate,
        qualification: input.qualification,
        distinction: input.distinction,
        remarks: input.remarks,
        approvedById
      },
      include: {
        student: true,
        enrollment: true,
        academicYear: true,
        terminalGrade: true
      }
    });

    await tx.academicEnrollment.update({
      where: { id: candidate.enrollmentId },
      data: {
        status: 'COMPLETED',
        statusChangedAt: new Date(),
        statusReason: 'Student graduated.'
      }
    });

    // Record academic progression history
    await recordAcademicProgression(tx, {
      schoolId,
      studentId: candidate.studentId,
      currentEnrollmentId: candidate.enrollmentId,
      academicYearId: candidate.academicYearId,
      previousGradeId: candidate.enrollment.gradeId,
      newGradeId: candidate.enrollment.gradeId,
      previousSectionId: candidate.enrollment.sectionId,
      newSectionId: candidate.enrollment.sectionId,
      action: 'GRADUATED',
      reason: 'Graduation record created and confirmed.',
      details: {
        graduationRecordId: record.id,
        graduationNumber: record.graduationNumber
      },
      performedById: approvedById
    });

    return record;
  });
};

export const getGraduationRecord = async (
  schoolId: string,
  recordId: string
) => {
  const record = await prisma.graduationRecord.findFirst({
    where: {
      id: recordId,
      schoolId
    },
    include: {
      student: true,
      enrollment: {
        include: {
          grade: true,
          section: true
        }
      },
      academicYear: true,
      terminalGrade: true,
      approvedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    }
  });

  if (!record) {
    throw new AppError('Graduation record not found.', 404);
  }

  return record;
};

export const getStudentGraduationRecords = async (
  schoolId: string,
  studentId: string
) => {
  return prisma.graduationRecord.findMany({
    where: {
      schoolId,
      studentId
    },
    include: {
      academicYear: true,
      terminalGrade: true
    },
    orderBy: {
      graduationDate: 'desc'
    }
  });
};

export const revokeGraduationRecord = async (
  schoolId: string,
  recordId: string,
  revokedById: string,
  reason: string
) => {
  return prisma.$transaction(async (tx) => {
    const record = await tx.graduationRecord.findFirst({
      where: {
        id: recordId,
        schoolId
      }
    });

    if (!record) {
      throw new AppError('Graduation record not found.', 404);
    }

    if (record.status === 'REVOKED') {
      throw new AppError(
        'Graduation record has already been revoked.',
        409
      );
    }

    return tx.graduationRecord.update({
      where: { id: record.id },
      data: {
        status: 'REVOKED',
        revokedById,
        revokedAt: new Date(),
        revocationReason: reason
      }
    });
  });
};
