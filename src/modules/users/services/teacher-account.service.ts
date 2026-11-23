
import { createUser } from './user.service.js';
import type { CreateTeacherAccountPayload } from '../validators/create-teacher-account.validator.js';

export const createTeacherAccount = (
  input: CreateTeacherAccountPayload
) => {
  return createUser({
    ...input,
    role: 'TEACHER'
  });
};
