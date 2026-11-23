
import { z } from 'zod';

export const admissionDocumentTypeSchema = z.enum([
  'BIRTH_CERTIFICATE',
  'PREVIOUS_REPORT_CARD',
  'TRANSFER_CERTIFICATE',
  'IDENTIFICATION',
  'PHOTOGRAPH',
  'OTHER'
]);

export const admissionDocumentQuerySchema = z.object({
  documentType: admissionDocumentTypeSchema.optional()
});

export type AdmissionDocumentType = z.infer<
  typeof admissionDocumentTypeSchema
>;
