
import { Router } from 'express';

 import { authorizeSchoolRoles } from '../../schools/index.js';

import {
  createTimetableConfigurationController,
  getTimetableConfigurationsController,
  getTimetableConfigurationController,
  updateTimetableConfigurationController
} from '../controllers/timetable-configuration.controller.js';

const router = Router();

const managementRoles = [
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL'
] as const;

router.post(
  '/configurations',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  createTimetableConfigurationController
);

router.get(
  '/configurations',
  authorizeSchoolRoles(...managementRoles),
  getTimetableConfigurationsController
);

router.get(
  '/configurations/:configurationId',
  authorizeSchoolRoles(...managementRoles),
  getTimetableConfigurationController
);

router.patch(
  '/configurations/:configurationId',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  updateTimetableConfigurationController
);

export default router;
