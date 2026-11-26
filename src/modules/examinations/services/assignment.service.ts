
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type { z } from 'zod';
import { createAssignmentSchema } from '../validators/assignment.validator.js';

import {
  recordExaminationHistory
} from '../../examinations/services/examination-history.service.js';

type CreateAssignmentInput =
  z.infer<typeof createAssignmentSchema>;

const toDatabaseTime = (time: string) =>
  new Date(`1970-01-01T${time}:00.000Z`);

/**
 * Create assignment and its associated examination.
 *
 * Examination creation and history recording happen
 * inside the same Prisma transaction.
 */
export const createAssignment = async (
  schoolId: string,
  createdById: string,
  input: CreateAssignmentInput
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Validate academic year.
    const academicYear = await tx.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      }
    });

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }

    // 2. Validate assignment due date.
    const dueDate = new Date(
      `${input.dueDate}T00:00:00.000Z`
    );

    if (
      dueDate < new Date(academicYear.startDate) ||
      dueDate > new Date(academicYear.endDate)
    ) {
      throw new AppError(
        'Assignment deadline must fall within the academic year.',
        400
      );
    }

    // 3. Validate semester.
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

    // 4. Validate grade.
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

    // 5. Validate section.
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

    // 6. Validate grade-subject relationship.
    if (
      !(await tx.gradeSubject.findFirst({
        where: {
          schoolId,
          gradeId: input.gradeId,
          subjectId: input.subjectId
        }
      }))
    ) {
      throw new AppError(
        'Subject is not assigned to the selected grade.',
        400
      );
    }

    // 7. Create examination.
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
        type: 'CONTINUOUS_ASSESSMENT',
        mode: input.mode,
        totalMarks: input.totalMarks,
        passingMarks: input.passingMarks ?? null,
        weight: input.weight ?? null,
        instructions: input.instructions,
        createdById
      }
    });

    // 8. Record examination creation history.
    // Uses the SAME transaction as examination creation.
    await recordExaminationHistory(tx, {
      schoolId,
      examinationId: examination.id,
      performedById: createdById,
      action: 'CREATED',
      newStatus: 'DRAFT',
      description: 'Examination created.'
    });

    // 9. Create assignment.
    return tx.assignment.create({
      data: {
        schoolId,
        examinationId: examination.id,
        dueDate,
        dueTime: input.dueTime
          ? toDatabaseTime(input.dueTime)
          : null,
        allowLateSubmission: input.allowLateSubmission,
        latePenaltyPercent: input.latePenaltyPercent ?? null,
        attemptsAllowed: input.attemptsAllowed,
        attachmentRequired: input.attachmentRequired,
        submissionInstructions: input.submissionInstructions
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
  });
};

/**
 * Get assignment by ID.
 */
export const getAssignmentById = async (
  schoolId: string,
  assignmentId: string
) => {
  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
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

  if (!assignment) {
    throw new AppError('Assignment not found.', 404);
  }

  return assignment;
};

/**
 * Get assignments with pagination and filters.
 */
export const getAssignments = async (
  schoolId: string,
  filters: {
    academicYearId?: string;
    gradeId?: string;
    sectionId?: string;
    subjectId?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }
) => {
  const where = {
    schoolId,

    ...(filters.startDate || filters.endDate
      ? {
          dueDate: {
            ...(filters.startDate && {
              gte: new Date(
                `${filters.startDate}T00:00:00.000Z`
              )
            }),
            ...(filters.endDate && {
              lte: new Date(
                `${filters.endDate}T00:00:00.000Z`
              )
            })
          }
        }
      : {}),

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
    prisma.assignment.findMany({
      where,
      include: {
        examination: {
          include: {
            academicYear: true,
            grade: true,
            section: true,
            subject: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),

    prisma.assignment.count({
      where
    })
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

/**
 * Update assignment.
 */
export const updateAssignment = async (
  schoolId: string,
  assignmentId: string,
  input: {
    dueDate?: string;
    dueTime?: string | null;
    allowLateSubmission?: boolean;
    latePenaltyPercent?: number | null;
    attemptsAllowed?: number;
    attachmentRequired?: boolean;
    submissionInstructions?: string | null;
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

  if (assignment.examination.status !== 'DRAFT') {
    throw new AppError(
      'Only draft assignments can be edited.',
      409
    );
  }

  const allowLate =
    input.allowLateSubmission ??
    assignment.allowLateSubmission;

  const penalty =
    input.latePenaltyPercent === undefined
      ? assignment.latePenaltyPercent
      : input.latePenaltyPercent;

  if (!allowLate && penalty !== null) {
    throw new AppError(
      'Disable the late penalty or enable late submissions.',
      400
    );
  }

  if (input.dueDate) {
    const date = new Date(
      `${input.dueDate}T00:00:00.000Z`
    );

    const year = await prisma.academicYear.findFirst({
      where: {
        id: assignment.examination.academicYearId,
        schoolId
      }
    });

    if (
      !year ||
      date < new Date(year.startDate) ||
      date > new Date(year.endDate)
    ) {
      throw new AppError(
        'Assignment deadline must fall within the academic year.',
        400
      );
    }
  }

  return prisma.assignment.update({
    where: {
      id: assignmentId
    },
    data: {
      ...(input.dueDate && {
        dueDate: new Date(
          `${input.dueDate}T00:00:00.000Z`
        )
      }),

      ...(input.dueTime !== undefined && {
        dueTime: input.dueTime
          ? toDatabaseTime(input.dueTime)
          : null
      }),

      ...(input.allowLateSubmission !== undefined && {
        allowLateSubmission: input.allowLateSubmission
      }),

      ...(input.latePenaltyPercent !== undefined && {
        latePenaltyPercent: input.latePenaltyPercent
      }),

      ...(input.attemptsAllowed !== undefined && {
        attemptsAllowed: input.attemptsAllowed
      }),

      ...(input.attachmentRequired !== undefined && {
        attachmentRequired: input.attachmentRequired
      }),

      ...(input.submissionInstructions !== undefined && {
        submissionInstructions: input.submissionInstructions
      })
    }
  });
};

/**
 * Delete draft assignment and its associated examination.
 */
export const deleteDraftAssignment = async (
  schoolId: string,
  assignmentId: string
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

  if (assignment.examination.status !== 'DRAFT') {
    throw new AppError(
      'Only draft assignments can be deleted.',
      409
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.assignment.delete({
      where: {
        id: assignmentId
      }
    });

    await tx.examination.delete({
      where: {
        id: assignment.examinationId
      }
    });
  });
};
