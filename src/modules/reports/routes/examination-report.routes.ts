
import { Router } from 'express';

import {
  generateExaminationReportController,
  getExaminationReportsController
} from '../controllers/examination-report.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';

 
const router = Router({ mergeParams: true });

router.post(
  '/',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  generateExaminationReportController
);

router.get(
  '/',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationReportsController
);

export default router;
