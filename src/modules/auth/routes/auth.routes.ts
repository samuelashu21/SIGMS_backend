
import { Router } from 'express';

import { loginController } from '../controllers/login.controller.js';
import { refreshController } from '../controllers/refresh.controller.js';
import { logoutController } from '../controllers/logout.controller.js';
import { logoutAllController } from '../controllers/logout-all.controller.js';
import { changePasswordController } from '../controllers/change-password.controller.js';
import { forgotPasswordController } from '../controllers/forgot-password.controller.js';
import { resetPasswordController } from '../controllers/reset-password.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';

import {
  
  passwordRecoveryRateLimiter,
  authenticationRateLimiter
} from '../../../middleware/rate-limit.middleware.js';
 
const router = Router();

router.post('/login', authenticationRateLimiter, loginController);

router.post(
  '/refresh',
  authenticationRateLimiter,
  refreshController
);

router.post('/logout', authenticate, logoutController);

router.post('/logout-all', authenticate, logoutAllController);

router.post(
  '/change-password',
  authenticate,
  changePasswordController
);

router.post(
  '/forgot-password',
  passwordRecoveryRateLimiter,
  forgotPasswordController
);

router.post(
  '/reset-password',
  passwordRecoveryRateLimiter,
  resetPasswordController
);

export default router;
