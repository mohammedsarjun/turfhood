import { Router } from 'express';
import { container } from 'tsyringe';
import { paymentCallbackRateLimiter } from '@presentation/shared/middlewares/rateLimiters';

import { BookingController } from '../controllers/BookingController.js';
const router = Router();
const controller = container.resolve(BookingController);
router.post('/payu/success', paymentCallbackRateLimiter, controller.payuSuccess);
router.post('/payu/failure', paymentCallbackRateLimiter, controller.payuFailure);
router.post('/payu/webhook', paymentCallbackRateLimiter, controller.webhook);
router.post('/payu/refund-webhook', paymentCallbackRateLimiter, controller.refundWebhook);
export default router;
