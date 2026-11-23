
import { createUser } from './user.service.js';
import type { CreateStudentAccountPayload } from '../validators/create-student-account.validator.js';

export const createStudentAccount = (
  input: CreateStudentAccountPayload
) => {
  return createUser({
    ...input,
    role: 'STUDENT'
  });
};
