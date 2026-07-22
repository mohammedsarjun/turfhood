import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminAuthController } from '@presentation/admin/controllers/AdminAuthController';
import { adminOnly } from '@presentation/admin/middlewares/adminOnly';
import { adminAuthRateLimiter } from '@presentation/shared/middlewares/rateLimiters';

import { validateAdminLoginRequest } from '../validators/adminLoginValidator.js';

const router = Router();
const adminAuthController = container.resolve(AdminAuthController);

router.post('/login', adminAuthRateLimiter, validateAdminLoginRequest, adminAuthController.login);
router.post('/logout', adminOnly, adminAuthController.logout);
router.post('/refresh', adminAuthRateLimiter, adminAuthController.refresh);
router.get('/me', adminOnly, adminAuthController.me);

export default router;
