
import { Router } from 'express';

 import { authorizeSchoolRoles } from '../../schools/index.js';

import {
  getTeacherTimetableController
} from '../controllers/teacher-timetable.controller.js';

const router = Router();

router.get(
  '/',
  authorizeSchoolRoles(
    'TEACHER',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  getTeacherTimetableController
);

export default router;
