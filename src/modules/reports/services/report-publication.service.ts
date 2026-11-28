
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type ReportType =
  | 'REPORT_CARD'
  | 'TRANSCRIPT'
  | 'ATTENDANCE'
  | 'EXAMINATION';

type PublicationAction = 'PUBLISH' | 'WITHDRAW';

type PublicationInput = {
  reportType: ReportType;
  reportId: string;
  action: PublicationAction;
  reason?: string;
};

export const updateReportPublication = async (
  schoolId: string,
  performedById: string,
  input: PublicationInput
) => {
  return prisma.$transaction(async (tx) => {
    const publishedAt = input.action === 'PUBLISH'
      ? new Date()
      : null;

    const status = input.action === 'PUBLISH'
      ? 'PUBLISHED'
      : 'WITHDRAWN';

    let report: { id: string; status: string } | null = null;

    if (input.reportType === 'REPORT_CARD') {
      const existing = await tx.reportCard.findFirst({
        where: { id: input.reportId, schoolId },
        select: { id: true, status: true }
      });

      if (!existing) {
        throw new AppError('Report card not found.', 404);
      }

      if (
        input.action === 'PUBLISH' &&
        existing.status !== 'GENERATED'
      ) {
        throw new AppError(
          'Only generated report cards can be published.',
          409
        );
      }

      if (
        input.action === 'WITHDRAW' &&
        existing.status !== 'PUBLISHED'
      ) {
        throw new AppError(
          'Only published report cards can be withdrawn.',
          409
        );
      }

      report = await tx.reportCard.update({
        where: { id: existing.id },
        data: {
          status,
          publishedAt,
          publishedById: input.action === 'PUBLISH'
            ? performedById
            : null,
          history: {
            create: {
              schoolId,
              performedById,
              action: input.action === 'PUBLISH'
                ? 'PUBLISHED'
                : 'WITHDRAWN',
              description: input.reason ?? null,
              previousValues: { status: existing.status },
              newValues: { status }
            }
          }
        },
        select: { id: true, status: true }
      });
    }

    if (input.reportType === 'TRANSCRIPT') {
      const existing = await tx.studentAcademicTranscript.findFirst({
        where: { id: input.reportId, schoolId },
        select: { id: true, status: true }
      });

      if (!existing) {
        throw new AppError('Transcript not found.', 404);
      }

      if (
        input.action === 'PUBLISH' &&
        existing.status !== 'GENERATED'
      ) {
        throw new AppError(
          'Only generated transcripts can be published.',
          409
        );
      }

      if (
        input.action === 'WITHDRAW' &&
        existing.status !== 'PUBLISHED'
      ) {
        throw new AppError(
          'Only published transcripts can be withdrawn.',
          409
        );
      }

      report = await tx.studentAcademicTranscript.update({
        where: { id: existing.id },
        data: {
          status,
          publishedAt,
          publishedById: input.action === 'PUBLISH'
            ? performedById
            : null,
          history: {
            create: {
              schoolId,
              performedById,
              action: input.action,
              description: input.reason ?? null,
              previousValues: { status: existing.status },
              newValues: { status }
            }
          }
        },
        select: { id: true, status: true }
      });
    }

    if (input.reportType === 'ATTENDANCE') {
      const existing = await tx.attendanceReport.findFirst({
        where: { id: input.reportId, schoolId },
        select: { id: true, status: true }
      });

      if (!existing) {
        throw new AppError('Attendance report not found.', 404);
      }

      if (
        input.action === 'PUBLISH' &&
        existing.status !== 'GENERATED'
      ) {
        throw new AppError(
          'Only generated attendance reports can be published.',
          409
        );
      }

      if (
        input.action === 'WITHDRAW' &&
        existing.status !== 'PUBLISHED'
      ) {
        throw new AppError(
          'Only published attendance reports can be withdrawn.',
          409
        );
      }

      report = await tx.attendanceReport.update({
        where: { id: existing.id },
        data: {
          status,
          publishedAt,
          publishedById: input.action === 'PUBLISH'
            ? performedById
            : null
        },
        select: { id: true, status: true }
      });
    }

    if (input.reportType === 'EXAMINATION') {
      const existing = await tx.examinationReport.findFirst({
        where: { id: input.reportId, schoolId },
        select: { id: true, status: true }
      });

      if (!existing) {
        throw new AppError('Examination report not found.', 404);
      }

      if (
        input.action === 'PUBLISH' &&
        existing.status !== 'GENERATED'
      ) {
        throw new AppError(
          'Only generated examination reports can be published.',
          409
        );
      }

      if (
        input.action === 'WITHDRAW' &&
        existing.status !== 'PUBLISHED'
      ) {
        throw new AppError(
          'Only published examination reports can be withdrawn.',
          409
        );
      }

      report = await tx.examinationReport.update({
        where: { id: existing.id },
        data: {
          status,
          publishedAt,
          publishedById: input.action === 'PUBLISH'
            ? performedById
            : null
        },
        select: { id: true, status: true }
      });
    }

    return report;
  });
};
