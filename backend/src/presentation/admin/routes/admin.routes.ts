import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminAuthController } from '@presentation/admin/controllers/AdminAuthController';
import { adminOnly } from '@presentation/admin/middlewares/adminOnly';
import { adminAuthRateLimiter } from '@presentation/shared/middlewares/rateLimiters';

import { validateAdminLoginRequest } from '../validators/adminLoginValidator.js';
import { BookingController } from '@presentation/booking/controllers/BookingController';

const router = Router();
const adminAuthController = container.resolve(AdminAuthController);
const bookingController = container.resolve(BookingController);

router.post('/login', adminAuthRateLimiter, validateAdminLoginRequest, adminAuthController.login);
router.post('/logout', adminOnly, adminAuthController.logout);
router.post('/refresh', adminAuthRateLimiter, adminAuthController.refresh);
router.get('/me', adminOnly, adminAuthController.me);
router.get('/refunds/escalated', adminOnly, bookingController.adminEscalatedRefunds);
router.post('/refunds/:id/verify', adminOnly, bookingController.adminVerifyRefund);

export default router;
