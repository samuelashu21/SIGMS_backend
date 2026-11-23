
import { randomBytes } from 'node:crypto';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import type {
  CreateAdmissionApplicationInput,
  UpdateAdmissionApplicationInput
} from '../validators/admission-application.validator.js';

const generateApplicationNumber = () => {
  const year = new Date().getFullYear();
  const suffix = randomBytes(4).toString('hex').toUpperCase();

  return `ADM-${year}-${suffix}`;
};

export const createAdmissionApplication = async (
  schoolId: string,
  createdById: string,
  input: CreateAdmissionApplicationInput
) => {
  const [grade, academicYear] = await Promise.all([
    prisma.grade.findFirst({
      where: {
        id: input.requestedGradeId,
        schoolId,
        isActive: true
      }
    }),
    prisma.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      }
    })
  ]);

  if (!grade) {
    throw new AppError('Requested grade not found or inactive.', 404);
  }

  if (!academicYear) {
    throw new AppError('Academic year not found.', 404);
  }

  return prisma.admissionApplication.create({
    data: {
      schoolId,
      createdById,
      applicationNumber: generateApplicationNumber(),
      applicantName: input.applicantName,
      dateOfBirth: input.dateOfBirth
        ? new Date(`${input.dateOfBirth}T00:00:00.000Z`)
        : null,
      gender: input.gender,
      requestedGradeId: input.requestedGradeId,
      academicYearId: input.academicYearId,
      notes: input.notes
    },
    include: {
      requestedGrade: true,
      academicYear: true
    }
  });
};

export const getAdmissionApplications = (
  schoolId: string,
  filters: {
    status?: CreateAdmissionApplicationInput extends never
      ? never
      : 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' |
        'NEEDS_INFORMATION' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
    academicYearId?: string;
    gradeId?: string;
    search?: string;
  }
) => {
  return prisma.admissionApplication.findMany({
    where: {
      schoolId,
      ...(filters.status && { status: filters.status }),
      ...(filters.academicYearId && {
        academicYearId: filters.academicYearId
      }),
      ...(filters.gradeId && {
        requestedGradeId: filters.gradeId
      }),
      ...(filters.search && {
        OR: [
          {
            applicantName: {
              contains: filters.search,
              mode: 'insensitive'
            }
          },
          {
            applicationNumber: {
              contains: filters.search,
              mode: 'insensitive'
            }
          }
        ]
      })
    },
    include: {
      requestedGrade: true,
      academicYear: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getAdmissionApplication = async (
  schoolId: string,
  applicationId: string
) => {
  const application = await prisma.admissionApplication.findFirst({
    where: {
      id: applicationId,
      schoolId
    },
    include: {
      requestedGrade: true,
      academicYear: true,
      createdBy: {
        select: {
          id: true,
          email: true,
          username: true,
          role: true
        }
      }
    }
  });

  if (!application) {
    throw new AppError('Admission application not found.', 404);
  }

  return application;
};

export const updateAdmissionApplication = async (
  schoolId: string,
  applicationId: string,
  input: UpdateAdmissionApplicationInput
) => {
  const application = await getAdmissionApplication(
    schoolId,
    applicationId
  );

  if (application.status !== 'DRAFT') {
    throw new AppError(
      'Only draft applications can be edited at this stage.',
      409
    );
  }

  if (input.requestedGradeId) {
    const grade = await prisma.grade.findFirst({
      where: {
        id: input.requestedGradeId,
        schoolId,
        isActive: true
      }
    });

    if (!grade) {
      throw new AppError('Requested grade not found or inactive.', 404);
    }
  }

  if (input.academicYearId) {
    const academicYear = await prisma.academicYear.findFirst({
      where: {
        id: input.academicYearId,
        schoolId
      }
    });

    if (!academicYear) {
      throw new AppError('Academic year not found.', 404);
    }
  }

  return prisma.admissionApplication.update({
    where: { id: applicationId },
    data: {
      ...input,
      ...(input.dateOfBirth !== undefined && {
        dateOfBirth: input.dateOfBirth
          ? new Date(`${input.dateOfBirth}T00:00:00.000Z`)
          : null
      })
    },
    include: {
      requestedGrade: true,
      academicYear: true
    }
  });
};
