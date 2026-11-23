
export const ENROLLMENT_STATUS_TRANSITIONS = {
  ACTIVE: ['SUSPENDED', 'WITHDRAWN', 'COMPLETED', 'CANCELLED'],
  SUSPENDED: ['ACTIVE', 'WITHDRAWN', 'CANCELLED'],
  WITHDRAWN: [],
  COMPLETED: [],
  CANCELLED: []
} as const;

export type EnrollmentStatus =
  keyof typeof ENROLLMENT_STATUS_TRANSITIONS;

export const isAllowedEnrollmentTransition = (
  current: EnrollmentStatus,
  next: EnrollmentStatus
): boolean => {
  return (
    ENROLLMENT_STATUS_TRANSITIONS[current] as readonly string[]
  ).includes(next);
};
