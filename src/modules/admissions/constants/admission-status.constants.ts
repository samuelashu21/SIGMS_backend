
export const ADMISSION_STATUS_TRANSITIONS = {
  DRAFT: ['SUBMITTED', 'WITHDRAWN'],
  SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN'],
  UNDER_REVIEW: ['NEEDS_INFORMATION', 'WITHDRAWN'],
  NEEDS_INFORMATION: ['SUBMITTED', 'WITHDRAWN'],
  APPROVED: [],
  REJECTED: [],
  WITHDRAWN: []
} as const;

export type AdmissionStatusValue =
  keyof typeof ADMISSION_STATUS_TRANSITIONS;

export const isAllowedAdmissionTransition = (
  current: AdmissionStatusValue,
  next: AdmissionStatusValue
): boolean => {
  return (
    ADMISSION_STATUS_TRANSITIONS[current] as readonly string[]
  ).includes(next);
};
