
import type PDFKit from 'pdfkit';

import {
  addPdfFooter,
  addPdfHeader
} from './pdf-generator.service.js';

type TranscriptPdfInput = {
  schoolName: string;
  transcriptNumber: string;
  studentName: string;
  studentNumber: string;
  cumulativePercentage: number;
  cumulativeGradePoint?: number | null;
  entries: Array<{
    academicYearName: string;
    gradeName: string;
    semesterName?: string | null;
    subjectName: string;
    percentage: number;
    letterGrade?: string | null;
    gradePoint?: number | null;
  }>;
};

export const renderTranscriptPdf = (
  document: PDFKit.PDFDocument,
  data: TranscriptPdfInput
) => {
  addPdfHeader(document, data.schoolName, 'ACADEMIC TRANSCRIPT');

  document.fontSize(10).font('Helvetica');

  document.text(`Transcript Number: ${data.transcriptNumber}`);
  document.text(`Student: ${data.studentName}`);
  document.text(`Student ID: ${data.studentNumber}`);

  document.moveDown();

  document.font('Helvetica-Bold');

  const headers = [
    'Year',
    'Grade',
    'Semester',
    'Subject',
    'Percent',
    'Grade'
  ];

  const positions = [45, 125, 190, 265, 425, 485];

  headers.forEach((header, index) => {
    document.text(header, positions[index], document.y, {
      width: 70
    });
  });

  document.moveDown(0.7);
  document.font('Helvetica');

  for (const entry of data.entries) {
    const y = document.y;

    document.text(entry.academicYearName, positions[0], y, { width: 75 });
    document.text(entry.gradeName, positions[1], y, { width: 60 });
    document.text(entry.semesterName ?? '-', positions[2], y, { width: 70 });
    document.text(entry.subjectName, positions[3], y, { width: 150 });
    document.text(`${entry.percentage.toFixed(2)}%`, positions[4], y);
    document.text(entry.letterGrade ?? '-', positions[5], y);

    document.moveDown(0.6);
  }

  document.moveDown();

  document.font('Helvetica-Bold');
  document.text(
    `Cumulative Percentage: ${data.cumulativePercentage.toFixed(2)}%`
  );

  document.text(
    `Cumulative Grade Point: ${data.cumulativeGradePoint ?? '-'}`
  );

  addPdfFooter(document, new Date());
};
