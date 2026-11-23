
import { Router } from 'express';

import {
  authenticate,
  authorizeRoles
} from '../../auth/middleware/index.js';

import {
  requireSchoolMembership,
  authorizeSchoolRoles
} from '../middleware/index.js';

import {
  registerSchoolController,
  getSchoolProfileController,
  updateSchoolProfileController
} from '../controllers/school.controller.js';

import {
  createSchoolAdministratorController
} from '../controllers/school-admin.controller.js';

import {
  getSchoolMembershipsController,
  updateSchoolMembershipController
} from '../controllers/school-membership.controller.js';

import {
  getSchoolConfigurationController,
  updateSchoolConfigurationController
} from '../controllers/school-configuration.controller.js';

import {
  getSchoolSettingsController,
  updateSchoolSettingsController
} from '../controllers/school-settings.controller.js';

import {
  tenantIsolationMiddleware
} from '../middleware/tenant-isolation.middleware.js';
import { getSchoolStudentController, getSchoolStudentsController } from '../controllers/tenant-data.controller.js';


import {
  createAcademicYearController,
  getAcademicYearsController,
  getAcademicYearController,
  updateAcademicYearController,
  setCurrentAcademicYearController
} from '../../academic/controllers/academic-year.controller.js';

import {
  createSemesterController,
  getSemestersController,
  updateSemesterController,
  setCurrentSemesterController
} from '../../academic/controllers/semester.controller.js';

const router = Router();

router.use(authenticate);

// Platform-level school registration
router.post(
  '/',
  authorizeRoles('SUPER_ADMIN'),
  registerSchoolController
);

// Platform-level administrator creation
router.post(
  '/:schoolId/administrators',
  authorizeRoles('SUPER_ADMIN'),
  createSchoolAdministratorController
);

// School-specific authorization
router.use('/:schoolId', requireSchoolMembership);

// School profile
router.get(
  '/:schoolId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getSchoolProfileController
);

router.patch(
  '/:schoolId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  updateSchoolProfileController
);

// Membership management
router.get(
  '/:schoolId/memberships',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  getSchoolMembershipsController
);

router.patch(
  '/:schoolId/memberships/:membershipId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  updateSchoolMembershipController
);

// School configuration
router.get(
  '/:schoolId/configuration',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  getSchoolConfigurationController
);

router.patch(
  '/:schoolId/configuration',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  updateSchoolConfigurationController
);

// School settings
router.get(
  '/:schoolId/settings',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  getSchoolSettingsController
);

router.patch(
  '/:schoolId/settings',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  updateSchoolSettingsController
);

router.use('/:schoolId', requireSchoolMembership);


router.get(
  '/:schoolId/students',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getSchoolStudentsController
);

router.get(
  '/:schoolId/students/:studentId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getSchoolStudentController
);


// Academic year management
router.post(
  '/:schoolId/academic-years',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  createAcademicYearController
);

router.get(
  '/:schoolId/academic-years',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getAcademicYearsController
);

router.get(
  '/:schoolId/academic-years/:academicYearId',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getAcademicYearController
);

router.patch(
  '/:schoolId/academic-years/:academicYearId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  updateAcademicYearController
);

router.patch(
  '/:schoolId/academic-years/:academicYearId/current',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  setCurrentAcademicYearController
);

// Semester management
router.post(
  '/:schoolId/academic-years/:academicYearId/semesters',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  createSemesterController
);

router.get(
  '/:schoolId/academic-years/:academicYearId/semesters',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getSemestersController
);

router.patch(
  '/:schoolId/semesters/:semesterId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  updateSemesterController
);

router.patch(
  '/:schoolId/semesters/:semesterId/current',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  setCurrentSemesterController
);

export default router;
