
import { Router } from 'express';

 
import {
  createAcademicCalendarEventController,
  listAcademicCalendarEventsController,
  getAcademicCalendarEventController,
  updateAcademicCalendarEventController
} from '../controllers/academic-calendar-event.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';


const router = Router();

router.post(
  '/',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  createAcademicCalendarEventController
);

router.get(
  '/',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER',
    'STUDENT',
    'PARENT'
  ),
  listAcademicCalendarEventsController
);

router.get(
  '/:eventId',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER',
    'STUDENT',
    'PARENT'
  ),
  getAcademicCalendarEventController
);

router.patch(
  '/:eventId',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  updateAcademicCalendarEventController
);

export default router;
