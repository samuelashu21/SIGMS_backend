
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type EligibilityReason = {
  rule: string;
  passed: boolean;
  expected: string;
  actual: string;
};

export const assessStudentPromotionEligibility = async (
  schoolId: string,
  assessedById: string,
  input: {
    studentId: string;
    enrollmentId: string;
    configurationId: string;
  }
) => {
  return prisma.$transaction(async (tx) => {
    // --------------------------------------------------
    // 1. Retrieve student enrollment
    // --------------------------------------------------

    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        id: input.enrollmentId,
        schoolId,
        studentId: input.studentId,
        status: {
          in: ['ACTIVE', 'COMPLETED']
        }
      },
      include: {
        academicYear: true,
        grade: true,
        section: true
      }
    });

    if (!enrollment) {
      throw new AppError(
        'Eligible academic enrollment was not found.',
        404
      );
    }

    // Validate nullable grade ID before using it in Prisma filters.
    const gradeId = enrollment.gradeId;

    if (!gradeId) {
      throw new AppError(
        'Student enrollment does not have an assigned grade.',
        409
      );
    }

    const sectionId = enrollment.sectionId;

    if (!sectionId) {
      throw new AppError(
        'Student enrollment does not have an assigned section.',
        409
      );
    }

    // --------------------------------------------------
    // 2. Retrieve active promotion configuration
    // --------------------------------------------------

    const configuration =
      await tx.promotionConfiguration.findFirst({
        where: {
          id: input.configurationId,
          schoolId,
          academicYearId: enrollment.academicYearId,
          status: 'ACTIVE'
        },
        include: {
          gradeRules: {
            where: {
              gradeId
            }
          }
        }
      });

    if (!configuration) {
      throw new AppError(
        'Active promotion configuration not found for this academic year.',
        404
      );
    }

    const gradeRule = configuration.gradeRules[0];

    if (!gradeRule) {
      throw new AppError(
        'No promotion rule is configured for this grade.',
        400
      );
    }

    // --------------------------------------------------
    // 3. Retrieve annual academic average
    // --------------------------------------------------

    const annualAverage =
      await tx.annualAcademicAverage.findFirst({
        where: {
          schoolId,
          studentId: input.studentId,
          academicYearId: enrollment.academicYearId
        }
      });

    if (!annualAverage) {
      throw new AppError(
        'Annual academic performance has not been calculated.',
        409
      );
    }

    const overallPercentage = Number(
      annualAverage.averagePercentage
    );

    const averageGradePoint =
      annualAverage.averageGradePoint === null
        ? null
        : Number(annualAverage.averageGradePoint);

    // --------------------------------------------------
    // 4. Retrieve subject grade results
    // --------------------------------------------------

    const subjectResults =
      await tx.subjectGradeResult.findMany({
        where: {
          schoolId,
          studentId: input.studentId,
          academicYearId: enrollment.academicYearId
        },
        select: {
          subjectId: true,
          letterGrade: true,
          finalPercentage: true,
          gradePoint: true,
          gradeRemark: true
        }
      });

    if (subjectResults.length === 0) {
      throw new AppError(
        'Subject grade results are unavailable.',
        409
      );
    }

    // --------------------------------------------------
    // 5. Calculate subject performance
    // --------------------------------------------------

    const totalSubjects = subjectResults.length;

    const passedSubjects = subjectResults.filter(
      (result) => Number(result.finalPercentage) >= 50
    ).length;

    const failedSubjects =
      totalSubjects - passedSubjects;

    // --------------------------------------------------
    // 6. Retrieve examinations
    // --------------------------------------------------

    const approvedExaminations =
      await tx.examination.findMany({
        where: {
          schoolId,
          academicYearId: enrollment.academicYearId,
          gradeId,
          OR: [
            { sectionId: null },
            { sectionId }
          ],
          status: {
            not: 'CANCELLED'
          }
        },
        select: {
          id: true,
          status: true
        }
      });

    const completedExaminations =
      approvedExaminations.length > 0 &&
      approvedExaminations.every(
        (exam) => exam.status === 'COMPLETED'
      );

    // --------------------------------------------------
    // 7. Check approved examination results
    // --------------------------------------------------

    const approvedMarkCounts =
      await tx.markRecord.count({
        where: {
          schoolId,
          examination: {
            academicYearId: enrollment.academicYearId,
            gradeId
          },
          studentId: input.studentId,
          status: 'APPROVED'
        }
      });

    const requiredApprovedResults =
      approvedExaminations.length;

    const approvedResults =
      requiredApprovedResults > 0 &&
      approvedMarkCounts >= requiredApprovedResults;

    // --------------------------------------------------
    // 8. Calculate attendance percentage
    // --------------------------------------------------

    const attendanceRecords =
      await tx.attendanceRecord.findMany({
        where: {
          schoolId,
          studentId: input.studentId,
          classAttendance: {
            is: {
              schoolId,
              academicYearId: enrollment.academicYearId,
              sectionId,
              status: 'APPROVED'
            }
          }
        },
        select: {
          status: true
        }
      });

    const attendancePercentage =
      attendanceRecords.length > 0
        ? (
            attendanceRecords.filter((record) =>
              ['PRESENT', 'LATE', 'HALF_DAY'].includes(
                record.status
              )
            ).length / attendanceRecords.length
          ) * 100
        : 0;

    // --------------------------------------------------
    // 9. Retrieve promotion thresholds
    // --------------------------------------------------

    const minimumOverall = Number(
      gradeRule.minimumOverallPercentage ??
      configuration.minimumOverallPercentage ??
      0
    );

    const minimumAttendance = Number(
      gradeRule.minimumAttendancePercentage ??
      configuration.minimumAttendancePercentage ??
      0
    );

    const minimumPassed =
      gradeRule.minimumPassedSubjects ??
      configuration.minimumPassedSubjects;

    const maximumFailed =
      gradeRule.maximumFailedSubjects ??
      configuration.maximumFailedSubjects;

    const requireCoreSubjects =
      gradeRule.requireAllCoreSubjectsPassed ??
      configuration.requireAllCoreSubjectsPassed;

    // --------------------------------------------------
    // 10. Evaluate promotion eligibility rules
    // --------------------------------------------------

    const reasons: EligibilityReason[] = [];

    const addReason = (
      rule: string,
      passed: boolean,
      expected: string,
      actual: string
    ) => {
      reasons.push({
        rule,
        passed,
        expected,
        actual
      });
    };

    addReason(
      'MINIMUM_OVERALL_PERCENTAGE',
      overallPercentage >= minimumOverall,
      `At least ${minimumOverall}%`,
      `${overallPercentage.toFixed(2)}%`
    );

    addReason(
      'MINIMUM_ATTENDANCE',
      attendancePercentage >= minimumAttendance,
      `At least ${minimumAttendance}%`,
      `${attendancePercentage.toFixed(2)}%`
    );

    addReason(
      'MINIMUM_PASSED_SUBJECTS',
      passedSubjects >= minimumPassed,
      `At least ${minimumPassed}`,
      String(passedSubjects)
    );

    addReason(
      'MAXIMUM_FAILED_SUBJECTS',
      failedSubjects <= maximumFailed,
      `At most ${maximumFailed}`,
      String(failedSubjects)
    );

    // --------------------------------------------------
    // 11. Minimum grade point requirement
    // --------------------------------------------------

    if (configuration.minimumGradePoint !== null) {
      const minimumGpa = Number(
        gradeRule.minimumGradePoint ??
        configuration.minimumGradePoint
      );

      addReason(
        'MINIMUM_GRADE_POINT',
        averageGradePoint !== null &&
          averageGradePoint >= minimumGpa,
        `At least ${minimumGpa}`,
        String(averageGradePoint ?? 'Unavailable')
      );
    }

    // --------------------------------------------------
    // 12. Check core subject requirements
    // --------------------------------------------------

    if (requireCoreSubjects) {
      const coreSubjectIds =
        await tx.gradeSubject.findMany({
          where: {
            schoolId,
            gradeId,
            isCore: true
          },
          select: {
            subjectId: true
          }
        });

      const coreIds = new Set(
        coreSubjectIds.map((item) => item.subjectId)
      );

      const coreResults = subjectResults.filter(
        (result) => coreIds.has(result.subjectId)
      );

      const allCorePassed =
        coreIds.size > 0 &&
        coreResults.length === coreIds.size &&
        coreResults.every(
          (result) =>
            Number(result.finalPercentage) >= 50
        );

      addReason(
        'CORE_SUBJECTS',
        allCorePassed,
        'All core subjects must be passed',
        `${coreResults.length} of ${coreIds.size} core subjects have results`
      );
    }

    // --------------------------------------------------
    // 13. Check examination completion
    // --------------------------------------------------

    if (configuration.requireCompletedExaminations) {
      addReason(
        'COMPLETED_EXAMINATIONS',
        completedExaminations,
        'All required examinations completed',
        `${
          approvedExaminations.filter(
            (exam) => exam.status === 'COMPLETED'
          ).length
        }/${approvedExaminations.length} completed`
      );
    }

    // --------------------------------------------------
    // 14. Check approved examination results
    // --------------------------------------------------

    if (configuration.requireApprovedResults) {
      addReason(
        'APPROVED_RESULTS',
        approvedResults,
        'All required examination results approved',
        `${approvedMarkCounts}/${requiredApprovedResults} approved mark records`
      );
    }

    // --------------------------------------------------
    // 15. Determine eligibility status
    // --------------------------------------------------

    const failedRules = reasons.filter(
      (reason) => !reason.passed
    );

    const status =
      failedRules.length === 0 && gradeRule.allowPromotion
        ? 'ELIGIBLE'
        : failedRules.length > 0
          ? 'NOT_ELIGIBLE'
          : 'REVIEW_REQUIRED';

    // --------------------------------------------------
    // 16. Save promotion eligibility assessment
    // --------------------------------------------------

    const assessment =
      await tx.promotionEligibilityAssessment.create({
        data: {
          schoolId,
          studentId: input.studentId,
          enrollmentId: input.enrollmentId,
          configurationId: input.configurationId,
          academicYearId: enrollment.academicYearId,

          status,

          overallPercentage,
          averageGradePoint,
          attendancePercentage,

          totalSubjects,
          passedSubjects,
          failedSubjects,

          completedExaminations,
          approvedResults,

          reasons,

          assessedById
        }
      });

    return assessment;
  });
};
