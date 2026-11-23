
import { z } from 'zod';

export const createAdmissionReviewSchema = z.object({
  reviewType: z.enum([
    'GENERAL_REVIEW',
    'DOCUMENT_REVIEW',
    'ELIGIBILITY_REVIEW',
    'RECOMMEND_APPROVAL',
    'RECOMMEND_REJECTION',
    'REQUEST_INFORMATION'
  ]),
  comments: z.string().trim().min(3).max(3000)
});

export type CreateAdmissionReviewInput = z.infer<
  typeof createAdmissionReviewSchema
>;
