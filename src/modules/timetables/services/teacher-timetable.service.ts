
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

type TeacherTimetableFilters = {
  academicYearId?: string;
  teacherProfileId?: string;
  day?: string;
  includeDrafts: boolean;
};

export const getTeacherTimetable = async (
  schoolId: string,
  requestingUserId: string,
  requestingRole: string,
  filters: TeacherTimetableFilters
) => {
  let teacherProfileId = filters.teacherProfileId;

  // Teachers can only view their own timetable.
  if (requestingRole === 'TEACHER') {
    const profile = await prisma.teacherProfile.findFirst({
      where: {
        schoolId,
        userId: requestingUserId,
        isActive: true
      },
      select: { id: true }
    });

    if (!profile) {
      throw new AppError('Teacher profile not found.', 404);
    }

    if (
      teacherProfileId &&
      teacherProfileId !== profile.id
    ) {
      throw new AppError(
        'You can only access your own timetable.',
        403
      );
    }

    teacherProfileId = profile.id;
  }

  if (!teacherProfileId) {
    throw new AppError('Teacher profile ID is required.', 400);
  }

  const teacher = await prisma.teacherProfile.findFirst({
    where: {
      id: teacherProfileId,
      schoolId,
      isActive: true
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true
        }
      }
    }
  });

  if (!teacher) {
    throw new AppError('Teacher profile not found.', 404);
  }

  const entries = await prisma.timetableEntry.findMany({
    where: {
      schoolId,
      teacherProfileId,
      ...(filters.day ? { day: filters.day as never } : {}),
      timetable: {
        schoolId,
        ...(filters.academicYearId
          ? { academicYearId: filters.academicYearId }
          : {}),
        ...(filters.includeDrafts
          ? { status: { in: ['DRAFT', 'PUBLISHED'] } }
          : { status: 'PUBLISHED' })
      }
    },
    include: {
      period: true,
      subject: true,
      timetable: {
        include: {
          section: {
            include: {
              grade: true
            }
          },
          academicYear: true
        }
      }
    },
    orderBy: [
      { day: 'asc' },
      { period: { periodNumber: 'asc' } }
    ]
  });

  const grouped = entries.reduce<Record<string, typeof entries>>(
    (result, entry) => {
      result[entry.day] ??= [];
      result[entry.day].push(entry);
      return result;
    },
    {}
  );

  return {
    teacher: {
      id: teacher.id,
      user: teacher.user
    },
    academicYearId: filters.academicYearId ?? null,
    days: grouped,
    totalScheduledPeriods: entries.length
  };
};
