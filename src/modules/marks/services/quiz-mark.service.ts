
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createMarkEntry,
  getExaminationMarkEntries
} from './mark-entry.service.js';

export const createQuizMark = async (
  schoolId: string,
  enteredById: string,
  quizId: string,
  input: {
    studentId: string;
    obtainedMarks: number;
    bonusMarks: number;
    penaltyMarks: number;
    remarks?: string;
  }
) => {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      schoolId
    },
    include: {
      examination: true
    }
  });

  if (!quiz) {
    throw new AppError('Quiz not found.', 404);
  }

  if (
    quiz.examination.status !== 'ONGOING' &&
    quiz.examination.status !== 'COMPLETED'
  ) {
    throw new AppError(
      'Quiz marks can only be entered while the associated assessment is ongoing or completed.',
      409
    );
  }

  return createMarkEntry(schoolId, enteredById, {
    examinationId: quiz.examinationId,
    studentId: input.studentId,
    obtainedMarks: input.obtainedMarks,
    bonusMarks: input.bonusMarks,
    penaltyMarks: input.penaltyMarks,
    remarks: input.remarks
  });
};

export const getQuizMarks = async (
  schoolId: string,
  quizId: string,
  page = 1,
  limit = 20
) => {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      schoolId
    },
    select: {
      examinationId: true
    }
  });

  if (!quiz) {
    throw new AppError('Quiz not found.', 404);
  }

  return getExaminationMarkEntries(
    schoolId,
    quiz.examinationId,
    page,
    limit
  );
};
