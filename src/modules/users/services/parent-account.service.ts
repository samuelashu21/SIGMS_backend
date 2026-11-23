
import { createUser } from './user.service.js';
import type { CreateParentAccountPayload } from '../validators/create-parent-account.validator.js';

export const createParentAccount = (
  input: CreateParentAccountPayload
) => {
  return createUser({
    ...input,
    role: 'PARENT'
  });
};
