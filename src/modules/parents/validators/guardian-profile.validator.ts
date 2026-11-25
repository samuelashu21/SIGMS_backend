
import { z } from 'zod';

export const createGuardianProfileSchema = z.object({
  userId: z.string().uuid(),

  firstName: z.string().trim().min(2).max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(2).max(100),

  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.iso.date().optional(),

  phoneNumber: z.string().trim().min(5).max(30),
  alternatePhone: z.string().trim().max(30).optional(),
  email: z.email().optional(),

  occupation: z.string().trim().max(150).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  region: z.string().trim().max(100).optional(),
  preferredLanguage: z.enum(['en', 'am']).optional()
});

export const updateGuardianProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(100).optional(),
  middleName: z.string().trim().max(100).nullable().optional(),
  lastName: z.string().trim().min(2).max(100).optional(),

  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
  dateOfBirth: z.iso.date().nullable().optional(),

  phoneNumber: z.string().trim().min(5).max(30).optional(),
  alternatePhone: z.string().trim().max(30).nullable().optional(),
  email: z.email().nullable().optional(),

  occupation: z.string().trim().max(150).nullable().optional(),
  address: z.string().trim().max(300).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  region: z.string().trim().max(100).nullable().optional(),
  preferredLanguage: z.enum(['en', 'am']).nullable().optional(),

  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one profile field is required.' }
);
