
import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';

import {
  generateStudentNumber
} from './student-identification.service.js';

export const registerStudentFromAdmission = async (
  schoolId: string,
  applicationId: string
) => {
  return prisma.$transaction(async (tx) => {
    const application = await tx.admissionApplication.findFirst({
      where: {
        id: applicationId,
        schoolId
      },
      include: {
        applicantInformation: true,
        student: true,
        academicYear: true
      }
    });

    if (!application) {
      throw new AppError('Admission application not found.', 404);
    }

    if (application.status !== 'APPROVED') {
      throw new AppError(
        'Only approved applicants can be registered as students.',
        409
      );
    }

    if (application.student) {
      throw new AppError(
        'This admission application is already registered.',
        409
      );
    }

    const information = application.applicantInformation;

    const studentNumber = await generateStudentNumber(
      tx,
      schoolId,
      application.academicYearId
    );

    const student = await tx.student.create({
      data: {
        schoolId,
        admissionApplicationId: application.id,
        studentNumber,
        fullName: application.applicantName,
        dateOfBirth: application.dateOfBirth,
        gender: application.gender,
        profile: {
          create: {
            schoolId,
            phoneNumber: information?.phoneNumber,
            email: information?.email,
            address: information?.address,
            city: information?.city,
            region: information?.region,
            previousSchool: information?.previousSchool
          }
        }
      },
      include: {
        profile: true
      }
    });

    return student;
  });
};
