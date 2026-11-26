
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createMarkEntry,
  getExaminationMarkEntries
} from './mark-entry.service.js';

export const createAssignmentMark = async (
  schoolId: string,
  enteredById: string,
  assignmentId: string,
  input: {
    studentId: string;
    obtainedMarks: number;
    bonusMarks: number;
    penaltyMarks: number;
    remarks?: string;
  }
) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      schoolId
    },
    include: {
      examination: true
    }
  });

  if (!assignment) {
    throw new AppError('Assignment not found.', 404);
  }

  if (
    assignment.examination.status !== 'ONGOING' &&
    assignment.examination.status !== 'COMPLETED'
  ) {
    throw new AppError(
      'Assignment marks can only be entered while the associated assessment is ongoing or completed.',
      409
    );
  }

  return createMarkEntry(schoolId, enteredById, {
    examinationId: assignment.examinationId,
    studentId: input.studentId,
    obtainedMarks: input.obtainedMarks,
    bonusMarks: input.bonusMarks,
    penaltyMarks: input.penaltyMarks,
    remarks: input.remarks
  });
};

export const getAssignmentMarks = async (
  schoolId: string,
  assignmentId: string,
  page = 1,
  limit = 20
) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      schoolId
    },
    select: {
      examinationId: true
    }
  });

  if (!assignment) {
    throw new AppError('Assignment not found.', 404);
  }

  return getExaminationMarkEntries(
    schoolId,
    assignment.examinationId,
    page,
    limit
  );
};
