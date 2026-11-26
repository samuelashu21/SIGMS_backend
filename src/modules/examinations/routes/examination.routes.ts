
import { Router } from 'express';

import {
  createExaminationTypeController,
  getExaminationTypesController,
  updateExaminationTypeController,
  deleteExaminationTypeController
} from '../controllers/examination-type.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';
import { getExaminationScheduleController, scheduleExaminationController } from '../controllers/examination-schedule.controller.js';
import { createExaminationController, deleteDraftExaminationController, getExaminationController, getExaminationsController, updateExaminationController } from '../controllers/examination.controller.js';
 
const router = Router();

router.post(
  '/types',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  createExaminationTypeController
);

router.get(
  '/types',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationTypesController
);

router.patch(
  '/types/:typeId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  updateExaminationTypeController
);

router.delete(
  '/types/:typeId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  deleteExaminationTypeController
);

// Examination creation and management
router.post(
  '/',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  createExaminationController
);

router.get(
  '/',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationsController
);

// Schedule listing must be registered before /:examinationId.
router.get(
  '/schedule',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationScheduleController
);

router.get(
  '/:examinationId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationController
);

router.patch(
  '/:examinationId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  updateExaminationController
);

router.delete(
  '/:examinationId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  deleteDraftExaminationController
);

// Examination scheduling
router.patch(
  '/:examinationId/schedule',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  scheduleExaminationController
);

export default router;
