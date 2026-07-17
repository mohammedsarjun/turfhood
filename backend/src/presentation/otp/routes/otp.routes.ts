import { Router } from 'express';
import { container } from 'tsyringe';
import { OtpController } from '@presentation/otp/controllers/OtpController';

import { validateResendOtpRequest } from '../validators/resendOtpValidator.js';
import { validateSendOtpRequest } from '../validators/sendOtpValidator.js';
import { validateVerifyOtpRequest } from '../validators/verifyOtpValidator.js';

const router = Router();
const otpController = container.resolve(OtpController);

router.post('/send', validateSendOtpRequest, otpController.sendOtp);
router.post('/verify', validateVerifyOtpRequest, otpController.verifyOtp);
router.post('/resend', validateResendOtpRequest, otpController.resendOtp);

export default router;
