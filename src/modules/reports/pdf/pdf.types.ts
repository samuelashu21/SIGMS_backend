
export type PdfDocumentMetadata = {
  schoolName: string;
  schoolAddress?: string | null;
  schoolPhone?: string | null;
  reportTitle: string;
  generatedAt: Date;
};

export type PdfStudentInformation = {
  studentName: string;
  studentNumber?: string | null;
  gradeName?: string | null;
  sectionName?: string | null;
};

export type PdfSubjectResult = {
  subjectName: string;
  maximumMarks: number;
  obtainedMarks: number;
  percentage: number;
  letterGrade?: string | null;
  gradePoint?: number | null;
  remark?: string | null;
};
