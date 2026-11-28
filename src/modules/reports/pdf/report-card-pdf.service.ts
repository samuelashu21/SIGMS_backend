
import type PDFKit from 'pdfkit';

import {
  addPdfFooter,
  addPdfHeader
} from './pdf-generator.service.js';

type ReportCardPdfInput = {
  schoolName: string;
  reportNumber: string;
  studentName: string;
  studentNumber: string;
  gradeName: string;
  sectionName: string;
  academicYearName: string;
  periodName: string;
  overallPercentage: number;
  overallGradePoint?: number | null;
  attendancePercentage?: number | null;
  teacherRemarks?: string | null;
  principalRemarks?: string | null;
  subjects: Array<{
    subjectName: string;
    maximumMarks: number;
    obtainedMarks: number;
    percentage: number;
    letterGrade?: string | null;
    gradePoint?: number | null;
    gradeRemark?: string | null;
  }>;
};

export const renderReportCardPdf = (
  document: PDFKit.PDFDocument,
  data: ReportCardPdfInput
) => {
  addPdfHeader(document, data.schoolName, 'STUDENT REPORT CARD');

  document.fontSize(10).font('Helvetica');

  document.text(`Report Number: ${data.reportNumber}`);
  document.text(`Student: ${data.studentName}`);
  document.text(`Student ID: ${data.studentNumber}`);
  document.text(`Grade: ${data.gradeName}`);
  document.text(`Section: ${data.sectionName}`);
  document.text(`Academic Year: ${data.academicYearName}`);
  document.text(`Period: ${data.periodName}`);

  document.moveDown();

  const columns = [45, 225, 290, 355, 420, 485];
  const headers = [
    'Subject',
    'Max',
    'Obtained',
    'Percent',
    'Grade'
  ];

  document.font('Helvetica-Bold');

  headers.forEach((header, index) => {
    document.text(header, columns[index], document.y, {
      width: index === 0 ? 175 : 60
    });
  });

  document.moveDown(0.6);
  document.font('Helvetica');

  for (const subject of data.subjects) {
    const y = document.y;

    document.text(subject.subjectName, columns[0], y, {
      width: 175
    });

    document.text(String(subject.maximumMarks), columns[1], y);
    document.text(String(subject.obtainedMarks), columns[2], y);
    document.text(`${subject.percentage.toFixed(2)}%`, columns[3], y);
    document.text(subject.letterGrade ?? '-', columns[4], y);

    document.moveDown(0.6);
  }

  document.moveDown();

  document.font('Helvetica-Bold');
  document.text(
    `Overall Percentage: ${data.overallPercentage.toFixed(2)}%`
  );

  document.text(
    `Overall Grade Point: ${data.overallGradePoint ?? '-'}`
  );

  document.text(
    `Attendance: ${data.attendancePercentage ?? '-'}%`
  );

  document.moveDown();

  document.font('Helvetica-Bold').text('Teacher Remarks');
  document.font('Helvetica').text(data.teacherRemarks || 'No remarks');

  document.moveDown();

  document.font('Helvetica-Bold').text('Principal Remarks');
  document.font('Helvetica').text(data.principalRemarks || 'No remarks');

  addPdfFooter(document, new Date());
};
