
import { Router } from 'express';

 
import {
  scheduleExaminationController,
  getExaminationScheduleController
} from '../controllers/examination-schedule.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';

const router = Router();

router.patch(
  '/:examinationId/schedule',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  scheduleExaminationController
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
  getExaminationScheduleController
);

export default router;
