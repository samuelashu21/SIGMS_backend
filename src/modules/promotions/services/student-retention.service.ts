
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';
import {
  recordAcademicProgression
} from './academic-progression-history.service.js';

type RetentionInput = {
  studentId: string;
  currentEnrollmentId: string;
  eligibilityAssessmentId: string;
  configurationId: string;
  nextAcademicYearId: string;
  targetSectionId: string;
  reason: string;
};

type DecisionMakerRole =
  | 'SCHOOL_ADMIN'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL';

export const retainStudent = async (
  schoolId: string,
  decidedById: string,
  decisionMakerRole: DecisionMakerRole,
  input: RetentionInput
) => {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        id: input.currentEnrollmentId,
        schoolId,
        studentId: input.studentId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      },
      include: {
        academicYear: true
      }
    });

    if (!enrollment) {
      throw new AppError('Current enrollment not found.', 404);
    }

    const existingDecision = await tx.promotionDecision.findFirst({
      where: {
        schoolId,
        currentEnrollmentId: enrollment.id
      }
    });

    if (existingDecision) {
      throw new AppError(
        'A promotion or retention decision already exists for this enrollment.',
        409
      );
    }

    const configuration = await tx.promotionConfiguration.findFirst({
      where: {
        id: input.configurationId,
        schoolId,
        academicYearId: enrollment.academicYearId,
        status: 'ACTIVE'
      }
    });

    if (!configuration) {
      throw new AppError(
        'Active promotion configuration not found.',
        404
      );
    }

    const assessment =
      await tx.promotionEligibilityAssessment.findFirst({
        where: {
          id: input.eligibilityAssessmentId,
          schoolId,
          studentId: input.studentId,
          enrollmentId: enrollment.id,
          configurationId: configuration.id
        }
      });

    if (!assessment) {
      throw new AppError(
        'Matching eligibility assessment not found.',
        404
      );
    }

    if (
      configuration.requirePrincipalApproval &&
      decisionMakerRole !== 'PRINCIPAL'
    ) {
      throw new AppError(
        'Principal approval is required for this retention decision.',
        403
      );
    }

    const nextYear = await tx.academicYear.findFirst({
      where: {
        id: input.nextAcademicYearId,
        schoolId
      }
    });

    if (!nextYear) {
      throw new AppError('Next academic year not found.', 404);
    }

    if (
      new Date(nextYear.startDate) <= new Date(enrollment.academicYear.endDate)
    ) {
      throw new AppError(
        'The selected academic year must follow the current academic year.',
        400
      );
    }

    const targetSection = await tx.section.findFirst({
      where: {
        id: input.targetSectionId,
        schoolId,
        gradeId: enrollment.gradeId,
        academicYearId: input.nextAcademicYearId
      },
      select: { id: true }
    });

    if (!targetSection) {
      throw new AppError(
        'The retention section must belong to the same grade and next academic year.',
        400
      );
    }

    const existingNextEnrollment =
      await tx.academicEnrollment.findFirst({
        where: {
          schoolId,
          studentId: input.studentId,
          academicYearId: input.nextAcademicYearId
        }
      });

    if (existingNextEnrollment) {
      throw new AppError(
        'The student is already enrolled in the selected academic year.',
        409
      );
    }

    const nextEnrollment = await tx.academicEnrollment.create({
      data: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.nextAcademicYearId,
        gradeId: enrollment.gradeId,
        sectionId: input.targetSectionId,
        enrollmentDate: new Date(),
        status: 'ACTIVE'
      }
    });

    await tx.academicEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'COMPLETED',
        statusChangedAt: new Date(),
        statusReason: input.reason
      }
    });

    const decision = await tx.promotionDecision.create({
      data: {
        schoolId,
        studentId: input.studentId,
        currentEnrollmentId: enrollment.id,
        nextEnrollmentId: nextEnrollment.id,
        eligibilityAssessmentId: assessment.id,
        configurationId: configuration.id,
        nextAcademicYearId: input.nextAcademicYearId,
        targetGradeId: enrollment.gradeId,
        targetSectionId: input.targetSectionId,
        action: 'RETAINED',
        reason: input.reason,
        decidedById
      },
      include: {
        student: true,
        currentEnrollment: true,
        nextEnrollment: true,
        targetGrade: true,
        targetSection: true
      }
    });

    // Record academic progression history
    await recordAcademicProgression(tx, {
      schoolId,
      studentId: enrollment.studentId,
      currentEnrollmentId: nextEnrollment.id,
      previousEnrollmentId: enrollment.id,
      academicYearId: input.nextAcademicYearId,
      previousGradeId: enrollment.gradeId,
      newGradeId: enrollment.gradeId,
      previousSectionId: enrollment.sectionId,
      newSectionId: input.targetSectionId,
      action: 'RETAINED',
      reason: input.reason,
      performedById: decidedById
    });

    return decision;
  });
};
