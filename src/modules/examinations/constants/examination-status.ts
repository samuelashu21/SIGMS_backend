
export const EXAMINATION_STATUS_TRANSITIONS = {
  DRAFT: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['ONGOING', 'CANCELLED'],
  ONGOING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
} as const;

export type ExaminationStatus =
  keyof typeof EXAMINATION_STATUS_TRANSITIONS;

export const isAllowedExaminationTransition = (
  currentStatus: ExaminationStatus,
  nextStatus: ExaminationStatus
): boolean => {
  return (
    EXAMINATION_STATUS_TRANSITIONS[currentStatus] as readonly string[]
  ).includes(nextStatus);
};
