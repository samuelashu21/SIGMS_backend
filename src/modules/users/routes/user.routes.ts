
import { Router } from 'express';

import {
  getRolesController,
  updateUserRoleController
} from '../controllers/user-role.controller.js';

import {
  createUserController,
  getUserController,
  getUsersController,
  updateUserController
} from '../controllers/user.controller.js';

import {
  authenticate,
  authorizeRoles
} from '../../auth/middleware/index.js';
import { updateUserStatusController } from '../controllers/user-status.controller.js';
import { archiveUserController } from '../controllers/user-archive.controller.js';
import { getUserActivityController } from '../controllers/user-activity.controller.js';
import { restoreUserController } from '../controllers/user-restore.controller.js';
import { createTeacherAccountController } from '../controllers/teacher-account.controller.js';
import { createStudentAccountController } from '../controllers/student-account.controller.js';
import { createParentAccountController } from '../controllers/parent-account.controller.js';
import { createMembershipController, getUserMembershipsController } from '../controllers/user-membership.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('SUPER_ADMIN'));

router.get('/roles', getRolesController);
router.get('/', getUsersController);
router.post('/', createUserController);

router.post('/teacher-accounts', createTeacherAccountController);
router.post('/student-accounts', createStudentAccountController);

router.post('/parent-accounts', createParentAccountController);

router.post( '/:userId/school-memberships', createMembershipController);

router.get('/:userId/school-memberships',getUserMembershipsController);

router.get('/:userId/activity', getUserActivityController);
router.patch('/:userId/restore', restoreUserController);
router.get('/:userId', getUserController);
router.patch('/:userId', updateUserController);
router.delete('/:userId', archiveUserController); 
router.patch('/:userId/role', updateUserRoleController);
router.patch('/:userId/status', updateUserStatusController);

export default router;
