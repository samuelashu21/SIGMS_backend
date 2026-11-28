
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export type ProtectedReportType =
  | 'REPORT_CARD'
  | 'TRANSCRIPT'
  | 'ATTENDANCE'
  | 'EXAMINATION';

const STAFF_ROLES = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'REGISTRAR',
  'TEACHER'
];

const getReportStudent = async (
  schoolId: string,
  reportType: ProtectedReportType,
  reportId: string
): Promise<string> => {
  if (reportType === 'REPORT_CARD') {
    const report = await prisma.reportCard.findFirst({
      where: {
        id: reportId,
        schoolId,
        status: 'PUBLISHED'
      },
      select: { studentId: true }
    });

    if (!report) {
      throw new AppError('Published report not found.', 404);
    }

    return report.studentId;
  }

  if (reportType === 'TRANSCRIPT') {
    const report = await prisma.studentAcademicTranscript.findFirst({
      where: {
        id: reportId,
        schoolId,
        status: 'PUBLISHED'
      },
      select: { studentId: true }
    });

    if (!report) {
      throw new AppError('Published transcript not found.', 404);
    }

    return report.studentId;
  }

  if (reportType === 'ATTENDANCE') {
    const report = await prisma.attendanceReport.findFirst({
      where: {
        id: reportId,
        schoolId,
        status: 'PUBLISHED'
      },
      select: { studentId: true }
    });

    if (!report) {
      throw new AppError('Published attendance report not found.', 404);
    }

    if (!report.studentId) {
      throw new AppError(
        'Section-level reports are not available through individual report access.',
        403
      );
    }

    return report.studentId;
  }

  const report = await prisma.examinationReport.findFirst({
    where: {
      id: reportId,
      schoolId,
      status: 'PUBLISHED'
    },
    select: { studentId: true }
  });

  if (!report) {
    throw new AppError('Published examination report not found.', 404);
  }

  if (!report.studentId) {
    throw new AppError(
      'This examination report is not an individual student report.',
      403
    );
  }

  return report.studentId;
};

export const assertReportAccess = async (input: {
  schoolId: string;
  userId: string;
  role: string;
  reportType: ProtectedReportType;
  reportId: string;
}) => {
  // Staff can access all published reports,
  // including section-level reports without a studentId.
  if (STAFF_ROLES.includes(input.role)) {
    let exists = false;

    if (input.reportType === 'REPORT_CARD') {
      exists = !!await prisma.reportCard.findFirst({
        where: {
          id: input.reportId,
          schoolId: input.schoolId,
          status: 'PUBLISHED'
        },
        select: { id: true }
      });
    } else if (input.reportType === 'TRANSCRIPT') {
      exists = !!await prisma.studentAcademicTranscript.findFirst({
        where: {
          id: input.reportId,
          schoolId: input.schoolId,
          status: 'PUBLISHED'
        },
        select: { id: true }
      });
    } else if (input.reportType === 'ATTENDANCE') {
      exists = !!await prisma.attendanceReport.findFirst({
        where: {
          id: input.reportId,
          schoolId: input.schoolId,
          status: 'PUBLISHED'
        },
        select: { id: true }
      });
    } else {
      exists = !!await prisma.examinationReport.findFirst({
        where: {
          id: input.reportId,
          schoolId: input.schoolId,
          status: 'PUBLISHED'
        },
        select: { id: true }
      });
    }

    if (!exists) {
      throw new AppError('Published report not found.', 404);
    }

    return { accessType: 'STAFF' as const };
  }

  // Resolve the individual student only for non-staff users.
  const studentId = await getReportStudent(
    input.schoolId,
    input.reportType,
    input.reportId
  );

  // STUDENT authorization
  if (input.role === 'STUDENT') {
    const link = await prisma.studentAccountLink.findFirst({
      where: {
        schoolId: input.schoolId,
        studentId,
        userId: input.userId,
        isActive: true,
        verifiedAt: { not: null }
      },
      select: { id: true }
    });

    if (!link) {
      throw new AppError(
        'You do not have permission to access this student report.',
        403
      );
    }

    return { studentId, accessType: 'STUDENT' as const };
  }

  // PARENT authorization
  if (input.role === 'PARENT') {
    const guardian = await prisma.guardianProfile.findFirst({
      where: {
        schoolId: input.schoolId,
        userId: input.userId,
        isActive: true
      },
      select: { id: true }
    });

    if (!guardian) {
      throw new AppError('Guardian profile not found.', 403);
    }

    const relationship =
      await prisma.studentGuardianRelationship.findFirst({
        where: {
          schoolId: input.schoolId,
          studentId,
          guardianId: guardian.id,
          status: 'VERIFIED'
        },
        include: {
          permission: true
        }
      });

    if (!relationship || !relationship.permission) {
      throw new AppError(
        'A verified guardian relationship and permissions are required.',
        403
      );
    }

    const permission = relationship.permission;

    const allowed =
      input.reportType === 'REPORT_CARD'
        ? permission.canViewReportCards
        : input.reportType === 'TRANSCRIPT'
          ? permission.canViewAcademicRecords
          : input.reportType === 'ATTENDANCE'
            ? permission.canViewAttendance
            : permission.canViewExamResults;

    if (!allowed) {
      throw new AppError(
        'Your guardian permissions do not allow access to this report.',
        403
      );
    }

    return { studentId, accessType: 'GUARDIAN' as const };
  }

  throw new AppError(
    'You are not authorized to access this report.',
    403
  );
};
