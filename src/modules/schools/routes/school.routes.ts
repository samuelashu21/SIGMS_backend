
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

export default router;
