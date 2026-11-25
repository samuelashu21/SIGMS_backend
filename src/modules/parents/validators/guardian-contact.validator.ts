
import { z } from 'zod';

export const createGuardianContactSchema = z.object({
  contactType: z.enum([
    'PHONE',
    'EMAIL',
    'ADDRESS',
    'EMERGENCY',
    'OTHER'
  ]),
  label: z.string().trim().max(100).optional(),
  value: z.string().trim().min(2).max(300),
  channel: z.enum([
    'SMS',
    'EMAIL',
    'PHONE_CALL',
    'IN_APP'
  ]).optional(),
  isPrimary: z.boolean().default(false)
});

export const updateGuardianContactSchema = z.object({
  contactType: z.enum([
    'PHONE',
    'EMAIL',
    'ADDRESS',
    'EMERGENCY',
    'OTHER'
  ]).optional(),
  label: z.string().trim().max(100).nullable().optional(),
  value: z.string().trim().min(2).max(300).optional(),
  channel: z.enum([
    'SMS',
    'EMAIL',
    'PHONE_CALL',
    'IN_APP'
  ]).nullable().optional(),
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one contact field is required.' }
);
