
import { prisma } from "../../../database/index.js";
import { AppError } from "../../../utils/app-error.js";
import {
  recordAcademicProgression,
} from "./academic-progression-history.service.js";

type PromotionInput = {
  studentId: string;
  currentEnrollmentId: string;
  eligibilityAssessmentId: string;
  configurationId: string;
  nextAcademicYearId: string;
  targetGradeId: string;
  targetSectionId: string;
  reason?: string;
  overrideReason?: string;
};

type DecisionMakerRole =
  | "SCHOOL_ADMIN"
  | "PRINCIPAL"
  | "VICE_PRINCIPAL";

export const promoteStudent = async (
  schoolId: string,
  decidedById: string,
  decisionMakerRole: DecisionMakerRole,
  input: PromotionInput,
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Find and validate the current enrollment.
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        id: input.currentEnrollmentId,
        schoolId,
        studentId: input.studentId,
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
      },
      include: {
        academicYear: true,
      },
    });

    if (!enrollment) {
      throw new AppError("Current enrollment not found.", 404);
    }

    // 2. Prevent duplicate promotion or retention decisions.
    const existingDecision = await tx.promotionDecision.findFirst({
      where: {
        schoolId,
        currentEnrollmentId: enrollment.id,
      },
    });

    if (existingDecision) {
      throw new AppError(
        "A promotion or retention decision already exists for this enrollment.",
        409,
      );
    }

    // 3. Validate the active promotion configuration.
    const configuration = await tx.promotionConfiguration.findFirst({
      where: {
        id: input.configurationId,
        schoolId,
        academicYearId: enrollment.academicYearId,
        status: "ACTIVE",
      },
    });

    if (!configuration) {
      throw new AppError("Active promotion configuration not found.", 404);
    }

    // 4. Validate the eligibility assessment.
    const assessment = await tx.promotionEligibilityAssessment.findFirst({
      where: {
        id: input.eligibilityAssessmentId,
        schoolId,
        studentId: input.studentId,
        enrollmentId: enrollment.id,
        configurationId: configuration.id,
      },
    });

    if (!assessment) {
      throw new AppError("Matching eligibility assessment not found.", 404);
    }

    const eligible = assessment.status === "ELIGIBLE";

    // 5. Require an authorized manual override when the student is not eligible.
    if (!eligible) {
      if (!configuration.allowManualOverride || !input.overrideReason) {
        throw new AppError(
          "Student is not eligible. An authorized manual override with a reason is required.",
          409,
        );
      }
    }

    // 6. Validate principal approval requirements.
    if (
      configuration.requirePrincipalApproval &&
      decisionMakerRole !== "PRINCIPAL"
    ) {
      throw new AppError(
        "Principal approval is required for this promotion.",
        403,
      );
    }

    // 7. Validate the next academic year.
    const nextYear = await tx.academicYear.findFirst({
      where: {
        id: input.nextAcademicYearId,
        schoolId,
      },
    });

    if (!nextYear) {
      throw new AppError("Next academic year not found.", 404);
    }

    if (
      new Date(nextYear.startDate) <=
      new Date(enrollment.academicYear.endDate)
    ) {
      throw new AppError(
        "The selected academic year must follow the current academic year.",
        400,
      );
    }

    // 8. Validate the target grade.
    const targetGrade = await tx.grade.findFirst({
      where: {
        id: input.targetGradeId,
        schoolId,
      },
      select: {
        id: true,
      },
    });

    if (!targetGrade) {
      throw new AppError("Target grade not found.", 404);
    }

    if (input.targetGradeId === enrollment.gradeId) {
      throw new AppError(
        "Promotion requires a target grade different from the current grade.",
        400,
      );
    }

    // 9. Validate the promotion grade configuration.
    const gradeRule = await tx.promotionGradeRule.findFirst({
      where: {
        schoolId,
        configurationId: configuration.id,
        gradeId: enrollment.gradeId,
      },
    });

    if (!gradeRule || !gradeRule.allowPromotion) {
      throw new AppError(
        "Promotion is not permitted by the current grade configuration.",
        409,
      );
    }

    // 10. Resolve the configured next grade before creating enrollment.
    const progressionRule = await tx.gradeProgressionRule.findFirst({
      where: {
        schoolId,
        academicYearId: enrollment.academicYearId,
        currentGradeId: enrollment.gradeId,
        isActive: true,
        isGraduationGrade: false,
        nextGradeId: input.targetGradeId,
      },
    });

    if (!progressionRule) {
      throw new AppError(
        "The selected target grade does not match the configured grade progression.",
        409,
      );
    }

    // 11. Validate the target section.
    const targetSection = await tx.section.findFirst({
      where: {
        id: input.targetSectionId,
        schoolId,
        gradeId: input.targetGradeId,
        academicYearId: input.nextAcademicYearId,
      },
      select: {
        id: true,
      },
    });

    if (!targetSection) {
      throw new AppError(
        "Target section does not belong to the selected grade and academic year.",
        400,
      );
    }

    // 12. Prevent duplicate enrollment in the next academic year.
    const existingNextEnrollment = await tx.academicEnrollment.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.nextAcademicYearId,
      },
    });

    if (existingNextEnrollment) {
      throw new AppError(
        "The student is already enrolled in the selected academic year.",
        409,
      );
    }

    // 13. Create the next academic enrollment.
    const nextEnrollment = await tx.academicEnrollment.create({
      data: {
        schoolId,
        studentId: input.studentId,
        academicYearId: input.nextAcademicYearId,
        gradeId: input.targetGradeId,
        sectionId: input.targetSectionId,
        enrollmentDate: new Date(),
        status: "ACTIVE",
      },
    });

    // 14. Complete the current enrollment.
    await tx.academicEnrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        status: "COMPLETED",
        statusChangedAt: new Date(),
        statusReason:
          input.reason ?? "Student promoted to the next grade.",
      },
    });

    // 15. Create the promotion decision.
    const decision = await tx.promotionDecision.create({
      data: {
        schoolId,
        studentId: input.studentId,
        currentEnrollmentId: enrollment.id,
        nextEnrollmentId: nextEnrollment.id,
        eligibilityAssessmentId: assessment.id,
        configurationId: configuration.id,
        nextAcademicYearId: input.nextAcademicYearId,
        targetGradeId: input.targetGradeId,
        targetSectionId: input.targetSectionId,
        action: "PROMOTED",
        reason: input.reason,
        overrideReason: eligible ? undefined : input.overrideReason,
        decidedById,
      },
      include: {
        student: true,
        currentEnrollment: true,
        nextEnrollment: true,
        targetGrade: true,
        targetSection: true,
      },
    });

    // 16. Record academic progression history.
    await recordAcademicProgression(tx, {
      schoolId,
      studentId: enrollment.studentId,
      currentEnrollmentId: nextEnrollment.id,
      previousEnrollmentId: enrollment.id,
      academicYearId: input.nextAcademicYearId,
      previousGradeId: enrollment.gradeId,
      newGradeId: input.targetGradeId,
      previousSectionId: enrollment.sectionId,
      newSectionId: input.targetSectionId,
      action: "PROMOTED",
      reason: input.reason ?? "Student promoted to the next grade.",
      performedById: decidedById,
    });

    // 17. Return the promotion decision.
    return decision;
  });
};
