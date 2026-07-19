import { Router } from 'express';
import { container } from 'tsyringe';
import { OtpController } from '@presentation/otp/controllers/OtpController';

import { requireOtpSession } from '../middlewares/requireOtpSession.js';
import { validateSendOtpRequest } from '../validators/sendOtpValidator.js';
import { validateVerifyOtpRequest } from '../validators/verifyOtpValidator.js';

const router = Router();
const otpController = container.resolve(OtpController);

router.post('/send', validateSendOtpRequest, otpController.sendOtp);
router.get('/session', requireOtpSession, otpController.getSession);
router.post('/verify', requireOtpSession, validateVerifyOtpRequest, otpController.verifyOtp);
router.post('/resend', requireOtpSession, otpController.resendOtp);

export default router;
