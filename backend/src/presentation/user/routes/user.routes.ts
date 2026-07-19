import { Router } from 'express';
import { container } from 'tsyringe';
import { LoginController } from '@presentation/user/controllers/LoginController';
import { SignUpController } from '@presentation/user/controllers/SignUpController';
import { MeController } from '@presentation/user/controllers/MeController';
import { GoogleAuthController } from '@presentation/user/controllers/GoogleAuthController';
import { authenticate } from '@presentation/shared/middlewares/authenticate';

import { validateLoginRequest } from '../validators/loginValidator';
import { validateSignUpRequest } from '../validators/signUpValidator';
import { validateGoogleAuthRequest } from '../validators/googleAuthValidator';

const router = Router();
const signUpController = container.resolve(SignUpController);
const loginController = container.resolve(LoginController);
const meController = container.resolve(MeController);
const googleAuthController = container.resolve(GoogleAuthController);

router.post('/signup', validateSignUpRequest, signUpController.handle);
router.post('/login', validateLoginRequest, loginController.handle);
router.post('/google', validateGoogleAuthRequest, googleAuthController.handle);
router.get('/me', authenticate, meController.handle);

export default router;
