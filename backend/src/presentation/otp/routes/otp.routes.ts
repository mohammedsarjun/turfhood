import { Router } from 'express';
import { container } from 'tsyringe';
import { OtpController } from '@presentation/otp/controllers/OtpController';
import { otpRateLimiter } from '@presentation/shared/middlewares/rateLimiters';

import { requireOtpSession } from '../middlewares/requireOtpSession.js';
import { validateSendOtpRequest } from '../validators/sendOtpValidator.js';
import { validateVerifyOtpRequest } from '../validators/verifyOtpValidator.js';

const router = Router();
const otpController = container.resolve(OtpController);

router.post('/send', otpRateLimiter, validateSendOtpRequest, otpController.sendOtp);
router.get('/session', requireOtpSession, otpController.getSession);
router.post(
  '/verify',
  otpRateLimiter,
  requireOtpSession,
  validateVerifyOtpRequest,
  otpController.verifyOtp,
);
router.post('/resend', otpRateLimiter, requireOtpSession, otpController.resendOtp);

export default router;
