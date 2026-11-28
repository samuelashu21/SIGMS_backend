
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const submitTimetable = async (
  schoolId: string,
  timetableId: string,
  userId: string,
  remarks?: string
) => {
  return prisma.$transaction(async (tx) => {
    const timetable = await tx.timetable.findFirst({
      where: { id: timetableId, schoolId },
      include: {
        entries: true,
        section: true
      }
    });

    if (!timetable) {
      throw new AppError('Timetable not found.', 404);
    }

    if (timetable.status !== 'DRAFT') {
      throw new AppError(
        'Only draft timetables can be submitted.',
        409
      );
    }

    if (timetable.entries.length === 0) {
      throw new AppError(
        'A timetable must contain entries before submission.',
        400
      );
    }

    return tx.timetable.update({
      where: { id: timetableId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submittedById: userId,
        submissionRemarks: remarks
      },
      include: {
        entries: true,
        section: true
      }
    });
  });
};

export const approveTimetable = async (
  schoolId: string,
  timetableId: string,
  approverId: string,
  remarks?: string
) => {
  return prisma.$transaction(async (tx) => {
    const timetable = await tx.timetable.findFirst({
      where: { id: timetableId, schoolId }
    });

    if (!timetable) {
      throw new AppError('Timetable not found.', 404);
    }

    if (timetable.status !== 'SUBMITTED') {
      throw new AppError(
        'Only submitted timetables can be approved.',
        409
      );
    }

    if (timetable.submittedById === approverId) {
      throw new AppError(
        'The timetable submitter cannot approve their own submission.',
        403
      );
    }

    return tx.timetable.update({
      where: { id: timetableId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedById: approverId,
        approvalRemarks: remarks
      },
      include: {
        entries: true,
        section: true
      }
    });
  });
};

export const publishTimetable = async (
  schoolId: string,
  timetableId: string,
  publisherId: string,
  remarks?: string
) => {
  return prisma.$transaction(async (tx) => {
    const timetable = await tx.timetable.findFirst({
      where: {
        id: timetableId,
        schoolId
      },
      include: {
        entries: true
      }
    });

    if (!timetable) {
      throw new AppError('Timetable not found.', 404);
    }

    if (timetable.status !== 'APPROVED') {
      throw new AppError(
        'Only approved timetables can be published.',
        409
      );
    }

    if (timetable.entries.length === 0) {
      throw new AppError(
        'Cannot publish an empty timetable.',
        400
      );
    }

    const existingPublished = await tx.timetable.findMany({
      where: {
        schoolId,
        academicYearId: timetable.academicYearId,
        sectionId: timetable.sectionId,
        status: 'PUBLISHED',
        id: { not: timetableId }
      },
      select: { id: true }
    });

    for (const existing of existingPublished) {
      await tx.timetable.update({
        where: { id: existing.id },
        data: { status: 'ARCHIVED' }
      });
    }

    const published = await tx.timetable.update({
      where: { id: timetableId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedById: publisherId,
        approvalRemarks: remarks ?? timetable.approvalRemarks
      },
      include: {
        entries: {
          include: {
            period: true,
            subject: true,
            teacher: true,
            classroom: true
          }
        },
        section: true
      }
    });

    return published;
  });
};

export const getPublishedSectionTimetable = async (
  schoolId: string,
  sectionId: string,
  academicYearId: string
) => {
  const timetable = await prisma.timetable.findFirst({
    where: {
      schoolId,
      sectionId,
      academicYearId,
      status: 'PUBLISHED'
    },
    include: {
      entries: {
        include: {
          period: true,
          subject: true,
          teacher: true,
          classroom: true
        },
        orderBy: [
          { day: 'asc' },
          { period: { periodNumber: 'asc' } }
        ]
      },
      section: true
    }
  });

  if (!timetable) {
    throw new AppError(
      'No published timetable exists for this section.',
      404
    );
  }

  return timetable;
};
