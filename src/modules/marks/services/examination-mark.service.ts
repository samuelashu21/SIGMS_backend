
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createMarkEntry,
  getExaminationMarkEntries
} from './mark-entry.service.js';

export const createExaminationMark = async (
  schoolId: string,
  enteredById: string,
  examinationId: string,
  input: {
    studentId: string;
    obtainedMarks: number;
    bonusMarks: number;
    penaltyMarks: number;
    remarks?: string;
  }
) => {
  const examination = await prisma.examination.findFirst({
    where: {
      id: examinationId,
      schoolId
    },
    select: {
      id: true,
      status: true
    }
  });

  if (!examination) {
    throw new AppError('Examination not found.', 404);
  }

  if (
    examination.status !== 'ONGOING' &&
    examination.status !== 'COMPLETED'
  ) {
    throw new AppError(
      'Examination marks can only be entered for ongoing or completed examinations.',
      409
    );
  }

  return createMarkEntry(schoolId, enteredById, {
    examinationId,
    studentId: input.studentId,
    obtainedMarks: input.obtainedMarks,
    bonusMarks: input.bonusMarks,
    penaltyMarks: input.penaltyMarks,
    remarks: input.remarks
  });
};

export const getExaminationMarks = async (
  schoolId: string,
  examinationId: string,
  page = 1,
  limit = 20
) => {
  return getExaminationMarkEntries(
    schoolId,
    examinationId,
    page,
    limit
  );
};
