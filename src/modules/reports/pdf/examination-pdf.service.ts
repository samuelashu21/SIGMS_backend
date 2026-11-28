
import type PDFKit from 'pdfkit';

import {
  addPdfFooter,
  addPdfHeader
} from './pdf-generator.service.js';

type ExaminationPdfInput = {
  schoolName: string;
  reportNumber: string;
  examinationName: string;
  totalStudents: number;
  averageMarks?: number | null;
  highestMarks?: number | null;
  lowestMarks?: number | null;
  passCount: number;
  failCount: number;
  passPercentage?: number | null;
  students: Array<{
    studentName: string;
    studentNumber?: string | null;
    finalMarks: number;
    percentage: number;
    passed: boolean;
  }>;
};

export const renderExaminationPdf = (
  document: PDFKit.PDFDocument,
  data: ExaminationPdfInput
) => {
  addPdfHeader(document, data.schoolName, 'EXAMINATION REPORT');

  document.fontSize(10).font('Helvetica');

  document.text(`Report Number: ${data.reportNumber}`);
  document.text(`Examination: ${data.examinationName}`);
  document.text(`Students: ${data.totalStudents}`);
  document.text(`Average Marks: ${data.averageMarks ?? '-'}`);
  document.text(`Highest Marks: ${data.highestMarks ?? '-'}`);
  document.text(`Lowest Marks: ${data.lowestMarks ?? '-'}`);
  document.text(`Passed: ${data.passCount}`);
  document.text(`Failed: ${data.failCount}`);
  document.text(`Pass Percentage: ${data.passPercentage ?? '-'}%`);

  document.moveDown();

  document.font('Helvetica-Bold');
  document.text('Student Results');

  document.moveDown(0.5);
  document.font('Helvetica');

  for (const student of data.students) {
    document.text(
      `${student.studentNumber ?? '-'} | ${student.studentName} | ` +
      `${student.finalMarks.toFixed(2)} | ` +
      `${student.percentage.toFixed(2)}% | ` +
      `${student.passed ? 'PASS' : 'FAIL'}`
    );
  }

  addPdfFooter(document, new Date());
};
