
import { Router } from 'express';

import { authenticate } from '../../../modules/auth/middleware/auth.middleware.js';
 
import {
  generateAnnualReportController,
  getAnnualReportsController
} from '../controllers/annual-report.controller.js';
import { authorizeSchoolRoles, requireSchoolMembership } from '../../schools/index.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireSchoolMembership);

router.post(
  '/',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'REGISTRAR'),
  generateAnnualReportController
);

router.get(
  '/',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'),
  getAnnualReportsController
);

export default router;
