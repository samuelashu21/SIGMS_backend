
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';
import { prisma } from '../../../database/index.js';

const getRequiredRouteParam = (
  req: Request,
  parameterName: string
): string => {
  const value = req.params[parameterName];

  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(
      `A valid ${parameterName} is required.`,
      400
    );
  }

  return value;
};

export const getAccessibleReportController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;

    if (!schoolId) {
      throw new AppError('School context is required.', 400);
    }

    const reportType = getRequiredRouteParam(req, 'reportType');
    const reportId = getRequiredRouteParam(req, 'reportId');

    let data: unknown = null;

    if (reportType === 'REPORT_CARD') {
      data = await prisma.reportCard.findFirst({
        where: {
          id: reportId,
          schoolId,
          status: 'PUBLISHED'
        },
        include: {
          school: true,
          student: true,
          academicYear: true,
          semester: true,
          grade: true,
          section: true,
          subjects: true,
          attendance: true
        }
      });
    } else if (reportType === 'TRANSCRIPT') {
      data = await prisma.studentAcademicTranscript.findFirst({
        where: {
          id: reportId,
          schoolId,
          status: 'PUBLISHED'
        },
        include: {
          school: true,
          student: true,
          entries: true
        }
      });
    } else if (reportType === 'ATTENDANCE') {
      data = await prisma.attendanceReport.findFirst({
        where: {
          id: reportId,
          schoolId,
          status: 'PUBLISHED'
        },
        include: {
          school: true,
          student: true,
          section: true,
          academicYear: true,
          semester: true
        }
      });
    } else if (reportType === 'EXAMINATION') {
      data = await prisma.examinationReport.findFirst({
        where: {
          id: reportId,
          schoolId,
          status: 'PUBLISHED'
        },
        include: {
          school: true,
          examination: true,
          student: true,
          section: true,
          subject: true
        }
      });
    } else {
      throw new AppError('Unsupported report type.', 400);
    }

    if (!data) {
      throw new AppError('Published report not found.', 404);
    }

    res.status(200).json({
      success: true,
      data
    });
  }
);
