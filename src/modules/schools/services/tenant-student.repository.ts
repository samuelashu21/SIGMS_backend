
import { prisma } from '../../../database/index.js';
import { tenantWhere } from './tenant-query.service.js';

export const findStudentsBySchool = (
  schoolId: string
) => {
  return prisma.student.findMany({
    where: tenantWhere(schoolId, {
      isActive: true
    }),
    select: {
      id: true,
      fullName: true,
      schoolId: true,
      isActive: true,
      createdAt: true
    },
    orderBy: {
      fullName: 'asc'
    }
  });
};

export const findStudentBySchool = (
  schoolId: string,
  studentId: string
) => {
  return prisma.student.findFirst({
    where: tenantWhere(schoolId, {
      id: studentId
    }),
    select: {
      id: true,
      fullName: true,
      schoolId: true,
      isActive: true,
      createdAt: true
    }
  });
};
