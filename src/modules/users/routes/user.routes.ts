
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

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('SUPER_ADMIN'));

router.get('/roles', getRolesController);
router.get('/', getUsersController);
router.post('/', createUserController);
router.get('/:userId', getUserController);
router.patch('/:userId', updateUserController);
router.delete('/:userId', archiveUserController); 
router.patch('/:userId/role', updateUserRoleController);
router.patch('/:userId/status', updateUserStatusController);

export default router;
