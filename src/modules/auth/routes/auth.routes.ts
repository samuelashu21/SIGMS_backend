
import { Router } from 'express';

import { loginController } from '../controllers/login.controller.js';
import { refreshController } from '../controllers/refresh.controller.js';
import { logoutController } from '../controllers/logout.controller.js';
import { logoutAllController } from '../controllers/logout-all.controller.js';
import { changePasswordController } from '../controllers/change-password.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';
import { forgotPasswordController } from '../controllers/forgot-password.controller.js';
import { resetPasswordController } from '../controllers/reset-password.controller.js';

const router = Router();

router.post('/login', loginController);
router.post('/refresh', refreshController);
router.post('/logout', authenticate, logoutController);
router.post('/logout-all', authenticate, logoutAllController);


router.post(
  '/change-password',
  authenticate,
  changePasswordController
);

router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

export default router;
