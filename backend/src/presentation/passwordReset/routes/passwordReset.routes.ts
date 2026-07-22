import { Router } from 'express';
import { container } from 'tsyringe';
import { PasswordResetController } from '@presentation/passwordReset/controllers/PasswordResetController';
import { passwordResetRateLimiter } from '@presentation/shared/middlewares/rateLimiters';

import { validateRequestPasswordResetRequest } from '../validators/requestPasswordResetValidator.js';
import { validateResetPasswordRequest } from '../validators/resetPasswordValidator.js';

const router = Router();
const passwordResetController = container.resolve(PasswordResetController);

router.post(
  '/request',
  passwordResetRateLimiter,
  validateRequestPasswordResetRequest,
  passwordResetController.requestReset,
);
router.post(
  '/reset',
  passwordResetRateLimiter,
  validateResetPasswordRequest,
  passwordResetController.resetPassword,
);

export default router;
