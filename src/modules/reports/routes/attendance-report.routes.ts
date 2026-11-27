
import { Router } from 'express';

import {
  generateAttendanceReportController,
  getAttendanceReportsController
} from '../controllers/attendance-report.controller.js';
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
  generateAttendanceReportController
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
  getAttendanceReportsController
);

export default router;
