
import { Router } from 'express';

import healthRoutes from './health.routes.js';
import authRoutes from '../modules/auth/routes/auth.routes.js';
import userRoutes from '../modules/users/routes/user.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
