
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';
import { createQuizSchema } from '../validators/quiz.validator.js';

type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const createQuiz = async (
  schoolId: string,
  createdById: string,
  input: CreateQuizInput
) => {
  return prisma.$transaction(async (tx) => {
    const academicYear = await tx.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      }
    });

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }

    if (
      input.semesterId &&
      !(await tx.semester.findFirst({
        where: {
          id: input.semesterId,
          schoolId,
          academicYearId: input.academicYearId
        }
      }))
    ) {
      throw new AppError('Invalid semester.', 400);
    }

    if (
      !(await tx.grade.findFirst({
        where: {
          id: input.gradeId,
          schoolId
        }
      }))
    ) {
      throw new AppError('Grade not found.', 404);
    }

    if (
      input.sectionId &&
      !(await tx.section.findFirst({
        where: {
          id: input.sectionId,
          schoolId,
          gradeId: input.gradeId,
          academicYearId: input.academicYearId
        }
      }))
    ) {
      throw new AppError('Invalid section assignment.', 400);
    }

    const gradeSubject = await tx.gradeSubject.findFirst({
      where: {
        schoolId,
        gradeId: input.gradeId,
        subjectId: input.subjectId
      }
    });

    if (!gradeSubject) {
      throw new AppError(
        'Subject is not assigned to the selected grade.',
        400
      );
    }

    const examination = await tx.examination.create({
      data: {
        schoolId,
        academicYearId: input.academicYearId,
        semesterId: input.semesterId ?? null,
        gradeId: input.gradeId,
        sectionId: input.sectionId ?? null,
        subjectId: input.subjectId,
        name: input.name,
        description: input.description,
        type: 'QUIZ',
        mode: input.mode,
        totalMarks: input.totalMarks,
        passingMarks: input.passingMarks ?? null,
        weight: input.weight ?? null,
        instructions: input.instructions,
        createdById
      }
    });

    const quiz = await tx.quiz.create({
      data: {
        schoolId,
        examinationId: examination.id,
        durationMinutes: input.durationMinutes,
        attemptsAllowed: input.attemptsAllowed,
        shuffleQuestions: input.shuffleQuestions,
        shuffleOptions: input.shuffleOptions,
        showResultsImmediately: input.showResultsImmediately,
        allowReview: input.allowReview,
        instructions: input.quizInstructions
      },
      include: {
        examination: {
          include: {
            academicYear: true,
            semester: true,
            grade: true,
            section: true,
            subject: true
          }
        }
      }
    });

    return quiz;
  });
};

export const getQuizById = async (
  schoolId: string,
  quizId: string
) => {
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      schoolId
    },
    include: {
      examination: {
        include: {
          academicYear: true,
          semester: true,
          grade: true,
          section: true,
          subject: true
        }
      }
    }
  });

  if (!quiz) {
    throw new AppError('Quiz not found.', 404);
  }

  return quiz;
};

export const getQuizzes = async (
  schoolId: string,
  filters: {
    academicYearId?: string;
    gradeId?: string;
    sectionId?: string;
    subjectId?: string;
    page: number;
    limit: number;
  }
) => {
  const where = {
    schoolId,
    examination: {
      schoolId,
      ...(filters.academicYearId && {
        academicYearId: filters.academicYearId
      }),
      ...(filters.gradeId && {
        gradeId: filters.gradeId
      }),
      ...(filters.sectionId && {
        sectionId: filters.sectionId
      }),
      ...(filters.subjectId && {
        subjectId: filters.subjectId
      })
    }
  };

  const [data, total] = await prisma.$transaction([
    prisma.quiz.findMany({
      where,
      include: {
        examination: {
          include: {
            grade: true,
            section: true,
            subject: true,
            academicYear: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    prisma.quiz.count({ where })
  ]);

  return {
    data,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const updateQuiz = async (
  schoolId: string,
  quizId: string,
  input: Partial<CreateQuizInput>
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

  if (quiz.examination.status !== 'DRAFT') {
    throw new AppError(
      'Only draft quizzes can be edited.',
      409
    );
  }

  return prisma.quiz.update({
    where: {
      id: quizId
    },
    data: {
      ...(input.durationMinutes !== undefined && {
        durationMinutes: input.durationMinutes
      }),
      ...(input.attemptsAllowed !== undefined && {
        attemptsAllowed: input.attemptsAllowed
      }),
      ...(input.shuffleQuestions !== undefined && {
        shuffleQuestions: input.shuffleQuestions
      }),
      ...(input.shuffleOptions !== undefined && {
        shuffleOptions: input.shuffleOptions
      }),
      ...(input.showResultsImmediately !== undefined && {
        showResultsImmediately: input.showResultsImmediately
      }),
      ...(input.allowReview !== undefined && {
        allowReview: input.allowReview
      }),
      ...(input.quizInstructions !== undefined && {
        instructions: input.quizInstructions
      })
    }
  });
};

export const deleteDraftQuiz = async (
  schoolId: string,
  quizId: string
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

  if (quiz.examination.status !== 'DRAFT') {
    throw new AppError(
      'Only draft quizzes can be deleted.',
      409
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.quiz.delete({
      where: { id: quizId }
    });

    await tx.examination.delete({
      where: { id: quiz.examinationId }
    });
  });
};
