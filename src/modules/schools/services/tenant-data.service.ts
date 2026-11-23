
import { AppError } from '../../../utils/app-error.js';

import {
  findStudentsBySchool,
  findStudentBySchool
} from './tenant-student.repository.js';

export const getSchoolStudents = async (schoolId: string) => {
  return findStudentsBySchool(schoolId);
};

export const getSchoolStudent = async (
  schoolId: string,
  studentId: string
) => {
  const student = await findStudentBySchool(
    schoolId,
    studentId
  );

  if (!student) {
    throw new AppError('Student not found in this school.', 404);
  }

  return student;
};
