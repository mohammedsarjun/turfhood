import { Router } from 'express';
import { container } from 'tsyringe';
import { LoginController } from '@presentation/user/controllers/LoginController';
import { SignUpController } from '@presentation/user/controllers/SignUpController';
import { MeController } from '@presentation/user/controllers/MeController';
import { GoogleAuthController } from '@presentation/user/controllers/GoogleAuthController';
import { ProfileController } from '@presentation/user/controllers/ProfileController';
import { LogoutController } from '@presentation/user/controllers/LogoutController';
import { authenticate } from '@presentation/shared/middlewares/authenticate';

import { requireEmailChangeOtpSession } from '../middlewares/requireEmailChangeOtpSession.js';
import { uploadAvatar } from '../middlewares/uploadAvatar.js';
import { validateLoginRequest } from '../validators/loginValidator';
import { validateSignUpRequest } from '../validators/signUpValidator';
import { validateGoogleAuthRequest } from '../validators/googleAuthValidator';
import { validateUpdateNameRequest } from '../validators/updateNameValidator.js';
import { validateUpdatePhoneRequest } from '../validators/updatePhoneValidator.js';
import { validateRequestEmailChangeRequest } from '../validators/requestEmailChangeValidator.js';
import { validateConfirmEmailChangeRequest } from '../validators/confirmEmailChangeValidator.js';
import { validateChangePasswordRequest } from '../validators/changePasswordValidator.js';
import { validateSetPasswordRequest } from '../validators/setPasswordValidator.js';

const router = Router();
const signUpController = container.resolve(SignUpController);
const loginController = container.resolve(LoginController);
const meController = container.resolve(MeController);
const googleAuthController = container.resolve(GoogleAuthController);
const profileController = container.resolve(ProfileController);
const logoutController = container.resolve(LogoutController);

router.post('/signup', validateSignUpRequest, signUpController.handle);
router.post('/login', validateLoginRequest, loginController.handle);
router.post('/google', validateGoogleAuthRequest, googleAuthController.handle);
router.get('/me', authenticate, meController.handle);
router.post('/logout', authenticate, logoutController.handle);

router.patch('/me/name', authenticate, validateUpdateNameRequest, profileController.updateName);
router.patch('/me/phone', authenticate, validateUpdatePhoneRequest, profileController.updatePhone);
router.post(
  '/me/email/request-change',
  authenticate,
  validateRequestEmailChangeRequest,
  profileController.requestEmailChange,
);
router.post(
  '/me/email/confirm-change',
  authenticate,
  requireEmailChangeOtpSession,
  validateConfirmEmailChangeRequest,
  profileController.confirmEmailChange,
);
router.post(
  '/me/password/change',
  authenticate,
  validateChangePasswordRequest,
  profileController.changePassword,
);
router.post(
  '/me/password/set',
  authenticate,
  validateSetPasswordRequest,
  profileController.setPassword,
);
router.post('/me/avatar', authenticate, uploadAvatar, profileController.uploadAvatar);

export default router;
