
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

export const getGuardianChildren = async (
  schoolId: string,
  userId: string
) => {
  const guardian = await prisma.guardianProfile.findFirst({
    where: {
      schoolId,
      userId,
      isActive: true
    },
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true
    }
  });

  if (!guardian) {
    throw new AppError('Guardian profile not found.', 404);
  }

  const relationships =
    await prisma.studentGuardianRelationship.findMany({
      where: {
        schoolId,
        guardianId: guardian.id,
        status: 'VERIFIED'
      },
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            fullName: true,
            dateOfBirth: true,
            isActive: true
          }
        },
        permission: true
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' }
      ]
    });

  return {
    guardian,
    children: relationships.map((relationship) => ({
      relationshipId: relationship.id,
      relationshipType: relationship.relationshipType,
      isPrimary: relationship.isPrimary,
      student: relationship.student,
      permissions: relationship.permission
    }))
  };
};

export const getGuardianChildDetails = async (
  schoolId: string,
  userId: string,
  studentId: string
) => {
  const guardian = await prisma.guardianProfile.findFirst({
    where: {
      schoolId,
      userId,
      isActive: true
    },
    select: { id: true }
  });

  if (!guardian) {
    throw new AppError('Guardian profile not found.', 404);
  }

  const relationship =
    await prisma.studentGuardianRelationship.findFirst({
      where: {
        schoolId,
        guardianId: guardian.id,
        studentId,
        status: 'VERIFIED'
      },
      include: {
        student: {
          include: {
            profile: true
          }
        },
        permission: true
      }
    });

  if (!relationship) {
    throw new AppError(
      'You do not have verified access to this student.',
      403
    );
  }

  return {
    relationshipId: relationship.id,
    relationshipType: relationship.relationshipType,
    isPrimary: relationship.isPrimary,
    student: relationship.student,
    permissions: relationship.permission
  };
};
