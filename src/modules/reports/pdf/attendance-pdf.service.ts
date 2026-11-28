
import type PDFKit from 'pdfkit';

import {
  addPdfFooter,
  addPdfHeader
} from './pdf-generator.service.js';

type AttendancePdfInput = {
  schoolName: string;
  reportNumber: string;
  studentName?: string | null;
  sectionName?: string | null;
  startDate: Date;
  endDate: Date;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  halfDayCount: number;
  attendancePercentage?: number | null;
};

export const renderAttendancePdf = (
  document: PDFKit.PDFDocument,
  data: AttendancePdfInput
) => {
  addPdfHeader(document, data.schoolName, 'ATTENDANCE REPORT');

  document.fontSize(10).font('Helvetica');

  document.text(`Report Number: ${data.reportNumber}`);
  document.text(`Student: ${data.studentName ?? 'Section report'}`);
  document.text(`Section: ${data.sectionName ?? '-'}`);
  document.text(`From: ${data.startDate.toISOString().slice(0, 10)}`);
  document.text(`To: ${data.endDate.toISOString().slice(0, 10)}`);

  document.moveDown();

  const rows = [
    ['Total Sessions', data.totalSessions],
    ['Present', data.presentCount],
    ['Absent', data.absentCount],
    ['Late', data.lateCount],
    ['Excused', data.excusedCount],
    ['Half Day', data.halfDayCount]
  ];

  for (const [label, value] of rows) {
    document.text(`${label}: ${value}`);
  }

  document.moveDown();

  document
    .font('Helvetica-Bold')
    .text(
      `Attendance Percentage: ${
        data.attendancePercentage === null ||
        data.attendancePercentage === undefined
          ? '-'
          : `${data.attendancePercentage.toFixed(2)}%`
      }`
    );

  addPdfFooter(document, new Date());
};
