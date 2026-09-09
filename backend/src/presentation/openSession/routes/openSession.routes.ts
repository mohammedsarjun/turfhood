import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import {
  bookingRateLimiter,
  paymentCallbackRateLimiter,
} from '@presentation/shared/middlewares/rateLimiters';
import { OpenSessionController } from '../controllers/OpenSessionController.js';

const router = Router();
const controller = container.resolve(OpenSessionController);
router.get('/', controller.list);
router.get('/mine', authenticate, controller.listMine);
router.get('/refunds/mine', authenticate, controller.listRefunds);
router.get('/:id', controller.details);
router.post('/', bookingRateLimiter, authenticate, controller.create);
router.post('/:id/join', bookingRateLimiter, authenticate, controller.join);
router.delete(
  '/:id/participants/me',
  bookingRateLimiter,
  authenticate,
  controller.cancelParticipation,
);
router.post('/payu/success', paymentCallbackRateLimiter, controller.payuSuccess);
router.post('/payu/failure', paymentCallbackRateLimiter, controller.payuFailure);
router.post('/payu/webhook', paymentCallbackRateLimiter, controller.webhook);
export default router;
