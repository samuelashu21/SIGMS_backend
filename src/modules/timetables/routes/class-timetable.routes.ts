
import { Router } from 'express';

 
import {
  createClassTimetableController,
  getClassTimetableController,
  listClassTimetablesController
} from '../controllers/class-timetable.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';

const router = Router();

router.post(
  '/',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  createClassTimetableController
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
  listClassTimetablesController
);

router.get(
  '/:timetableId',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getClassTimetableController
);

export default router;
