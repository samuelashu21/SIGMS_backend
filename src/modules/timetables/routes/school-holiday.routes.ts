
import { Router } from 'express';

 
import {
  createSchoolHolidayController,
  listSchoolHolidaysController,
  getSchoolHolidayController,
  updateSchoolHolidayController
} from '../controllers/school-holiday.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';


const router = Router();

router.post(
  '/',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  createSchoolHolidayController
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
  listSchoolHolidaysController
);

router.get(
  '/:holidayId',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getSchoolHolidayController
);

router.patch(
  '/:holidayId',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  updateSchoolHolidayController
);

export default router;
