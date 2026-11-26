
import { z } from 'zod';

export const createAcademicGradingConfigurationSchema = z.object({
  academicYearId: z.string().uuid(),
  gradingSystemId: z.string().uuid(),
  calculationMethod: z.enum([
    'WEIGHTED_AVERAGE',
    'SIMPLE_AVERAGE'
  ]).default('WEIGHTED_AVERAGE'),
  passingPercentage: z.coerce.number().min(0).max(100).default(50),
  decimalPlaces: z.number().int().min(0).max(4).default(2),
  roundingMode: z.enum([
    'ROUND',
    'ROUND_UP',
    'ROUND_DOWN'
  ]).default('ROUND'),
  requireAllAssessments: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

export const updateAcademicGradingConfigurationSchema =
  createAcademicGradingConfigurationSchema
    .omit({
      academicYearId: true,
      gradingSystemId: true
    })
    .partial();
