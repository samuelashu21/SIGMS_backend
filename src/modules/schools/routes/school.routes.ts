
import { Router } from 'express';

import { authenticate, authorizeRoles } from '../../auth/middleware/index.js';
import { registerSchoolController } from '../controllers/school.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('SUPER_ADMIN'));

router.post('/', registerSchoolController);

export default router;
