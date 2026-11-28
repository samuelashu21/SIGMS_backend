
import { Router } from 'express';

import { authorizeSchoolRoles } from '../../../middleware/authorize.middleware.js';

import {
  submitTimetableController,
  approveTimetableController,
  publishTimetableController,
  getPublishedSectionTimetableController
} from '../controllers/timetable-publication.controller.js';

const router = Router();

router.patch(
  '/:timetableId/submit',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'),
  submitTimetableController
);

router.patch(
  '/:timetableId/approve',
  authorizeSchoolRoles('PRINCIPAL'),
  approveTimetableController
);

router.patch(
  '/:timetableId/publish',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  publishTimetableController
);

router.get(
  '/published/section',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER',
    'STUDENT',
    'PARENT'
  ),
  getPublishedSectionTimetableController
);

export default router;
