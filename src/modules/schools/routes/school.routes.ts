
import { Router } from 'express';

import { authenticate, authorizeRoles } from '../../auth/middleware/index.js';
import { getSchoolProfileController, registerSchoolController, updateSchoolProfileController } from '../controllers/school.controller.js';
import { getSchoolConfigurationController, updateSchoolConfigurationController } from '../controllers/school-configuration.controller.js';
import { createSchoolAdministratorController } from '../controllers/school-admin.controller.js';
import { getSchoolMembershipsController, updateSchoolMembershipController } from '../controllers/school-membership.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('SUPER_ADMIN'));

router.post('/', registerSchoolController);

router.get('/:schoolId', getSchoolProfileController);
router.patch('/:schoolId', updateSchoolProfileController);

router.get(
  '/:schoolId/configuration',
  getSchoolConfigurationController
);

router.patch(
  '/:schoolId/configuration',
  updateSchoolConfigurationController
);

router.post(
  '/:schoolId/administrators',
  createSchoolAdministratorController
);


router.get(
  '/:schoolId/memberships',
  getSchoolMembershipsController
);

router.patch(
  '/:schoolId/memberships/:membershipId',
  updateSchoolMembershipController
);

export default router;
