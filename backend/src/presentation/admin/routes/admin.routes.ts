import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminAuthController } from '@presentation/admin/controllers/AdminAuthController';
import { adminOnly } from '@presentation/admin/middlewares/adminOnly';
import { adminAuthRateLimiter } from '@presentation/shared/middlewares/rateLimiters';

import { validateAdminLoginRequest } from '../validators/adminLoginValidator.js';
import { BookingController } from '@presentation/booking/controllers/BookingController';
import { AdminDashboardController } from '@presentation/admin/controllers/AdminDashboardController';
import { AdminManagementController } from '@presentation/admin/controllers/AdminManagementController';
import { PayoutController } from '@presentation/payout/controllers/PayoutController';
import { validateWithdrawalRejection } from '@presentation/payout/validators/payoutValidators';

const router = Router();
const adminAuthController = container.resolve(AdminAuthController);
const bookingController = container.resolve(BookingController);
const dashboardController = container.resolve(AdminDashboardController);
const managementController = container.resolve(AdminManagementController);
const payoutController = container.resolve(PayoutController);

router.post('/login', adminAuthRateLimiter, validateAdminLoginRequest, adminAuthController.login);
router.post('/logout', adminOnly, adminAuthController.logout);
router.post('/refresh', adminAuthRateLimiter, adminAuthController.refresh);
router.get('/me', adminOnly, adminAuthController.me);
router.get('/dashboard', adminOnly, dashboardController.get);
router.get('/revenue', adminOnly, dashboardController.getRevenue);
router.get('/users', adminOnly, managementController.listUsers);
router.post('/users/:id/suspend', adminOnly, managementController.suspendUser);
router.post('/users/:id/unsuspend', adminOnly, managementController.unsuspendUser);
router.get('/turfs', adminOnly, managementController.listTurfs);
router.post('/turfs/:id/suspend', adminOnly, managementController.suspendTurf);
router.post('/turfs/:id/unsuspend', adminOnly, managementController.unsuspendTurf);
router.get('/refunds/escalated', adminOnly, bookingController.adminEscalatedRefunds);
router.post('/refunds/:id/verify', adminOnly, bookingController.adminVerifyRefund);
router.get('/withdrawal-requests', adminOnly, payoutController.adminList);
router.post('/withdrawal-requests/:id/paid', adminOnly, payoutController.markPaid);
router.post(
  '/withdrawal-requests/:id/reject',
  adminOnly,
  validateWithdrawalRejection,
  payoutController.reject,
);

export default router;
