
import { AppError } from '../../../utils/app-error.js';

export const tenantWhere = <T extends object>(
  schoolId: string,
  conditions: T = {} as T
) => ({
  ...conditions,
  schoolId
});

export const tenantCreateData = <T extends object>(
  schoolId: string,
  data: T
) => ({
  ...data,
  schoolId
});

export const assertTenantOwnership = (
  record: { schoolId: string } | null,
  schoolId: string
) => {
  if (!record || record.schoolId !== schoolId) {
    throw new AppError('Record not found.', 404);
  }

  return record;
};
