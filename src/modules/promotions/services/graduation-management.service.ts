
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type GraduationReason = {
  rule: string;
  passed: boolean;
  expected: string;
  actual: string;
};

export const assessGraduationCandidate = async (
  schoolId: string,
  assessedById: string,
  input: {
    studentId: string;
    enrollmentId: string;
    configurationId: string;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const enrollment = await tx.academicEnrollment.findFirst({
      where: {
        id: input.enrollmentId,
        schoolId,
        studentId: input.studentId,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      },
      include: {
        academicYear: true
      }
    });

    if (!enrollment) {
      throw new AppError('Student enrollment not found.', 404);
    }

    const configuration = await tx.graduationConfiguration.findFirst({
      where: {
        id: input.configurationId,
        schoolId,
        academicYearId: enrollment.academicYearId,
        terminalGradeId: enrollment.gradeId,
        status: 'ACTIVE'
      }
    });

    if (!configuration) {
      throw new AppError(
        'Active graduation configuration not found for this grade and academic year.',
        404
      );
    }

    const progression = await tx.gradeProgressionRule.findFirst({
      where: {
        schoolId,
        academicYearId: enrollment.academicYearId,
        currentGradeId: enrollment.gradeId,
        isActive: true,
        isGraduationGrade: true,
        nextGradeId: null
      }
    });

    if (!progression) {
      throw new AppError(
        'The student is not enrolled in a configured graduation grade.',
        409
      );
    }

    const annualAverage = await tx.annualAcademicAverage.findFirst({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: enrollment.academicYearId
      }
    });

    if (!annualAverage) {
      throw new AppError(
        'Annual academic results have not been calculated.',
        409
      );
    }

    const subjectResults = await tx.subjectGradeResult.findMany({
      where: {
        schoolId,
        studentId: input.studentId,
        academicYearId: enrollment.academicYearId
      },
      select: {
        subjectId: true,
        finalPercentage: true
      }
    });

    const examinations = await tx.examination.findMany({
      where: {
        schoolId,
        academicYearId: enrollment.academicYearId,
        gradeId: enrollment.gradeId,
        OR: [
          { sectionId: null },
          { sectionId: enrollment.sectionId }
        ],
        status: { not: 'CANCELLED' }
      },
      select: {
        id: true,
        status: true
      }
    });

    const completedExaminations = examinations.every(
      (exam) => exam.status === 'COMPLETED'
    );

    const approvedMarks = await tx.markRecord.count({
      where: {
        schoolId,
        studentId: input.studentId,
        examinationId: {
          in: examinations.map((exam) => exam.id)
        },
        status: {
          in: ['APPROVED', 'PUBLISHED']
        }
      }
    });

    const approvedResults =
      examinations.length > 0 &&
      approvedMarks >= examinations.length;

    const attendance = await tx.attendanceRecord.findMany({
      where: {
        schoolId,
        studentId: input.studentId,
        classAttendance: {
          schoolId,
          academicYearId: enrollment.academicYearId,
          sectionId: enrollment.sectionId,
          status: 'APPROVED'
        }
      },
      select: { status: true }
    });

    const attendancePercentage = attendance.length > 0
      ? attendance.filter((record) =>
          ['PRESENT', 'LATE', 'HALF_DAY'].includes(record.status)
        ).length / attendance.length * 100
      : 0;

    const overallPercentage = Number(annualAverage.averagePercentage);

    const averageGradePoint =
      annualAverage.averageGradePoint === null
        ? null
        : Number(annualAverage.averageGradePoint);

    const passedSubjects = annualAverage.passedSubjects;
    const failedSubjects = annualAverage.failedSubjects;
    const totalSubjects = annualAverage.totalSubjects;

    const reasons: GraduationReason[] = [];

    const addReason = (
      rule: string,
      passed: boolean,
      expected: string,
      actual: string
    ) => {
      reasons.push({ rule, passed, expected, actual });
    };

    if (configuration.minimumOverallPercentage !== null) {
      const minimum = Number(configuration.minimumOverallPercentage);

      addReason(
        'MINIMUM_OVERALL_PERCENTAGE',
        overallPercentage >= minimum,
        `At least ${minimum}%`,
        `${overallPercentage.toFixed(2)}%`
      );
    }

    if (configuration.minimumGradePoint !== null) {
      const minimum = Number(configuration.minimumGradePoint);

      addReason(
        'MINIMUM_GRADE_POINT',
        averageGradePoint !== null && averageGradePoint >= minimum,
        `At least ${minimum}`,
        String(averageGradePoint ?? 'Unavailable')
      );
    }

    if (configuration.minimumAttendancePercentage !== null) {
      const minimum = Number(
        configuration.minimumAttendancePercentage
      );

      addReason(
        'MINIMUM_ATTENDANCE',
        attendancePercentage >= minimum,
        `At least ${minimum}%`,
        `${attendancePercentage.toFixed(2)}%`
      );
    }

    addReason(
      'MINIMUM_PASSED_SUBJECTS',
      passedSubjects >= configuration.minimumPassedSubjects,
      `At least ${configuration.minimumPassedSubjects}`,
      String(passedSubjects)
    );

    addReason(
      'MAXIMUM_FAILED_SUBJECTS',
      failedSubjects <= configuration.maximumFailedSubjects,
      `At most ${configuration.maximumFailedSubjects}`,
      String(failedSubjects)
    );

    if (configuration.requireAllCoreSubjectsPassed) {
      const coreSubjects = await tx.gradeSubject.findMany({
        where: {
          schoolId,
          gradeId: enrollment.gradeId,
          isCore: true
        },
        select: { subjectId: true }
      });

      const coreIds = new Set(
        coreSubjects.map((subject) => subject.subjectId)
      );

      const coreResults = subjectResults.filter((result) =>
        coreIds.has(result.subjectId)
      );

      const allCoreSubjectsPassed =
        coreResults.length === coreIds.size &&
        coreResults.every((result) => Number(result.finalPercentage) >= 50);

      addReason(
        'CORE_SUBJECTS',
        allCoreSubjectsPassed,
        'All core subjects must be passed',
        `${coreResults.length}/${coreIds.size} core subjects assessed`
      );
    }

    if (configuration.requireCompletedExaminations) {
      addReason(
        'COMPLETED_EXAMINATIONS',
        examinations.length > 0 && completedExaminations,
        'All required examinations completed',
        `${examinations.filter((exam) => exam.status === 'COMPLETED').length}/${examinations.length}`
      );
    }

    if (configuration.requireApprovedResults) {
      addReason(
        'APPROVED_RESULTS',
        approvedResults,
        'Approved marks for all required examinations',
        `${approvedMarks}/${examinations.length}`
      );
    }

    const hasFailedRequirements = reasons.some(
      (reason) => !reason.passed
    );

    const status = hasFailedRequirements
      ? 'NOT_ELIGIBLE'
      : 'ELIGIBLE';

    const candidate = await tx.graduationCandidate.upsert({
      where: {
        schoolId_studentId_academicYearId: {
          schoolId,
          studentId: input.studentId,
          academicYearId: enrollment.academicYearId
        }
      },
      create: {
        schoolId,
        studentId: input.studentId,
        enrollmentId: enrollment.id,
        configurationId: configuration.id,
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
        assessmentReasons: reasons,
        assessedById
      },
      update: {
        enrollmentId: enrollment.id,
        configurationId: configuration.id,
        status,
        overallPercentage,
        averageGradePoint,
        attendancePercentage,
        totalSubjects,
        passedSubjects,
        failedSubjects,
        completedExaminations,
        approvedResults,
        assessmentReasons: reasons,
        assessedById,
        assessedAt: new Date(),
        reviewedById: null,
        reviewedAt: null,
        reviewNotes: null
      }
    });

    return candidate;
  });
};

export const getGraduationCandidates = async (
  schoolId: string,
  academicYearId: string,
  status?: 'PENDING' | 'ELIGIBLE' | 'NOT_ELIGIBLE' |
    'REVIEW_REQUIRED' | 'APPROVED' | 'REJECTED'
) => {
  return prisma.graduationCandidate.findMany({
    where: {
      schoolId,
      academicYearId,
      ...(status ? { status } : {})
    },
    include: {
      student: true,
      enrollment: {
        include: {
          grade: true,
          section: true
        }
      },
      configuration: true,
      assessedBy: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    },
    orderBy: [
      { status: 'asc' },
      { assessedAt: 'desc' }
    ]
  });
};

export const reviewGraduationCandidate = async (
  schoolId: string,
  candidateId: string,
  reviewedById: string,
  decision: 'APPROVED' | 'REJECTED',
  reviewNotes: string
) => {
  const candidate = await prisma.graduationCandidate.findFirst({
    where: {
      id: candidateId,
      schoolId
    }
  });

  if (!candidate) {
    throw new AppError('Graduation candidate not found.', 404);
  }

  if (
    !['ELIGIBLE', 'NOT_ELIGIBLE', 'REVIEW_REQUIRED'].includes(
      candidate.status
    )
  ) {
    throw new AppError(
      'This candidate has already been reviewed.',
      409
    );
  }

  if (decision === 'APPROVED' && candidate.status !== 'ELIGIBLE') {
    throw new AppError(
      'Only eligible candidates can be approved for graduation.',
      409
    );
  }

  return prisma.graduationCandidate.update({
    where: { id: candidate.id },
    data: {
      status: decision,
      reviewedById,
      reviewedAt: new Date(),
      reviewNotes
    },
    include: {
      student: true,
      enrollment: true
    }
  });
};
