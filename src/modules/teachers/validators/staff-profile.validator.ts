
import { z } from 'zod';

export const createStaffProfileSchema = z.object({
  userId: z.string().uuid(),
  employeeNumber: z.string().trim().min(1).max(50),

  firstName: z.string().trim().min(2).max(100),
  middleName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().min(2).max(100),

  category: z.enum([
    'ADMINISTRATIVE',
    'REGISTRAR',
    'MANAGEMENT',
    'SUPPORT',
    'OTHER'
  ]),

  designation: z.string().trim().min(2).max(150),
  department: z.string().trim().max(150).optional(),

  phoneNumber: z.string().trim().max(30).optional(),
  email: z.email().optional(),
  address: z.string().trim().max(300).optional(),

  hireDate: z.iso.date()
});

export const updateStaffProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(100).optional(),
  middleName: z.string().trim().max(100).nullable().optional(),
  lastName: z.string().trim().min(2).max(100).optional(),

  category: z.enum([
    'ADMINISTRATIVE',
    'REGISTRAR',
    'MANAGEMENT',
    'SUPPORT',
    'OTHER'
  ]).optional(),

  designation: z.string().trim().min(2).max(150).optional(),
  department: z.string().trim().max(150).nullable().optional(),

  phoneNumber: z.string().trim().max(30).nullable().optional(),
  email: z.email().nullable().optional(),
  address: z.string().trim().max(300).nullable().optional(),

  employmentStatus: z.enum([
    'ACTIVE',
    'ON_LEAVE',
    'SUSPENDED',
    'TERMINATED'
  ]).optional(),

  terminationDate: z.iso.date().nullable().optional(),
  isActive: z.boolean().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one staff field is required.' }
);
