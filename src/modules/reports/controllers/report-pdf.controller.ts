
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';
import { prisma } from '../../../database/index.js';

import { generatePdfBuffer } from '../pdf/report-pdf-storage.service.js';

import { renderReportCardPdf } from '../pdf/report-card-pdf.service.js';
import { renderTranscriptPdf } from '../pdf/transcript-pdf.service.js';
import { renderAttendancePdf } from '../pdf/attendance-pdf.service.js';
import { renderExaminationPdf } from '../pdf/examination-pdf.service.js';

/**
 * Safely retrieves a route parameter as a string.
 * Express may type route parameters as string | string[].
 */
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

/**
 * Download published report card PDF.
 */
export const downloadReportCardPdfController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const reportCardId = getRequiredRouteParam(req, 'reportId');

    if (!schoolId) {
      throw new AppError('School context is required.', 400);
    }

    const report = await prisma.reportCard.findFirst({
      where: {
        id: reportCardId,
        schoolId,
        status: 'PUBLISHED'
      },
      include: {
        school: true,
        student: true,
        grade: true,
        section: true,
        academicYear: true,
        semester: true,
        subjects: true,
        attendance: true
      }
    });

    if (!report) {
      throw new AppError('Published report card not found.', 404);
    }

    const buffer = await generatePdfBuffer((document) => {
      renderReportCardPdf(document, {
        schoolName: report.school.name,
        reportNumber: report.reportNumber,
        studentName: report.student.fullName,
        studentNumber: report.student.studentNumber ?? '',
        gradeName: report.grade.name,
        sectionName: report.section.name,
        academicYearName: report.academicYear.name,
        periodName: report.semester?.name ?? 'Annual',

        overallPercentage: Number(
          report.overallPercentage ?? 0
        ),

        overallGradePoint:
          report.overallGradePoint === null
            ? null
            : Number(report.overallGradePoint),

        attendancePercentage: report.attendance
          ? Number(report.attendance.attendancePercentage)
          : null,

        teacherRemarks: report.teacherRemarks,
        principalRemarks: report.principalRemarks,

        subjects: report.subjects.map((subject) => ({
          subjectName: subject.subjectName,
          maximumMarks: Number(subject.maximumMarks),
          obtainedMarks: Number(subject.obtainedMarks),
          percentage: Number(subject.percentage),
          letterGrade: subject.letterGrade,

          gradePoint:
            subject.gradePoint === null
              ? null
              : Number(subject.gradePoint),

          gradeRemark: subject.gradeRemark
        }))
      });
    });

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.reportNumber}.pdf"`
    );

    res.send(buffer);
  }
);

/**
 * Download published academic transcript PDF.
 */
export const downloadTranscriptPdfController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const transcriptId = getRequiredRouteParam(
      req,
      'transcriptId'
    );

    if (!schoolId) {
      throw new AppError('School context is required.', 400);
    }

    const transcript =
      await prisma.studentAcademicTranscript.findFirst({
        where: {
          id: transcriptId,
          schoolId,
          status: 'PUBLISHED'
        },
        include: {
          school: true,
          student: true,
          entries: true
        }
      });

    if (!transcript) {
      throw new AppError('Published transcript not found.', 404);
    }

    const buffer = await generatePdfBuffer((document) => {
      renderTranscriptPdf(document, {
        schoolName: transcript.school.name,
        transcriptNumber: transcript.transcriptNumber,
        studentName: transcript.student.fullName,
        studentNumber: transcript.student.studentNumber ?? '',

        cumulativePercentage: Number(
          transcript.cumulativePercentage ?? 0
        ),

        cumulativeGradePoint:
          transcript.cumulativeGradePoint === null
            ? null
            : Number(transcript.cumulativeGradePoint),

        entries: transcript.entries.map((entry) => ({
          academicYearName: entry.academicYearName,
          gradeName: entry.gradeName,
          semesterName: entry.semesterName,
          subjectName: entry.subjectName,
          percentage: Number(entry.percentage),
          letterGrade: entry.letterGrade,

          gradePoint:
            entry.gradePoint === null
              ? null
              : Number(entry.gradePoint)
        }))
      });
    });

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${transcript.transcriptNumber}.pdf"`
    );

    res.send(buffer);
  }
);

/**
 * Download published attendance report PDF.
 */
export const downloadAttendanceReportPdfController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const reportId = getRequiredRouteParam(req, 'reportId');

    if (!schoolId) {
      throw new AppError('School context is required.', 400);
    }

    const report = await prisma.attendanceReport.findFirst({
      where: {
        id: reportId,
        schoolId,
        status: 'PUBLISHED'
      },
      include: {
        school: true,
        student: true,
        section: true
      }
    });

    if (!report) {
      throw new AppError('Published attendance report not found.', 404);
    }

    const buffer = await generatePdfBuffer((document) => {
      renderAttendancePdf(document, {
        schoolName: report.school.name,
        reportNumber: report.reportNumber,
        studentName: report.student?.fullName,
        sectionName: report.section?.name,
        startDate: report.startDate,
        endDate: report.endDate,
        totalSessions: report.totalSessions,
        presentCount: report.presentCount,
        absentCount: report.absentCount,
        lateCount: report.lateCount,
        excusedCount: report.excusedCount,
        halfDayCount: report.halfDayCount,

        attendancePercentage:
          report.attendancePercentage === null
            ? null
            : Number(report.attendancePercentage)
      });
    });

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.reportNumber}.pdf"`
    );

    res.send(buffer);
  }
);

/**
 * Download published examination report PDF.
 */
export const downloadExaminationReportPdfController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const reportId = getRequiredRouteParam(req, 'reportId');

    if (!schoolId) {
      throw new AppError('School context is required.', 400);
    }

    const report = await prisma.examinationReport.findFirst({
      where: {
        id: reportId,
        schoolId,
        status: 'PUBLISHED'
      },
      include: {
        school: true,
        examination: true
      }
    });

    if (!report) {
      throw new AppError('Published examination report not found.', 404);
    }

    const details = report.reportDetails as {
      students?: Array<{
        studentName: string;
        studentNumber?: string | null;
        finalMarks: number;
        percentage: number;
        passed: boolean;
      }>;
    } | null;

    const buffer = await generatePdfBuffer((document) => {
      renderExaminationPdf(document, {
        schoolName: report.school.name,
        reportNumber: report.reportNumber,
        examinationName: report.examination.name,
        totalStudents: report.totalStudents,

        averageMarks:
          report.averageMarks === null
            ? null
            : Number(report.averageMarks),

        highestMarks:
          report.highestMarks === null
            ? null
            : Number(report.highestMarks),

        lowestMarks:
          report.lowestMarks === null
            ? null
            : Number(report.lowestMarks),

        passCount: report.passCount,
        failCount: report.failCount,

        passPercentage:
          report.passPercentage === null
            ? null
            : Number(report.passPercentage),

        students: details?.students ?? []
      });
    });

    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.reportNumber}.pdf"`
    );

    res.send(buffer);
  }
);
