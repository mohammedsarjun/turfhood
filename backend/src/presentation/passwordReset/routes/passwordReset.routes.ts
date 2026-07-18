import { Router } from 'express';
import { container } from 'tsyringe';
import { PasswordResetController } from '@presentation/passwordReset/controllers/PasswordResetController';

import { validateRequestPasswordResetRequest } from '../validators/requestPasswordResetValidator.js';
import { validateResetPasswordRequest } from '../validators/resetPasswordValidator.js';

const router = Router();
const passwordResetController = container.resolve(PasswordResetController);

router.post('/request', validateRequestPasswordResetRequest, passwordResetController.requestReset);
router.post('/reset', validateResetPasswordRequest, passwordResetController.resetPassword);

export default router;
