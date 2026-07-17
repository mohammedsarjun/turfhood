import { Router } from 'express';
import { container } from 'tsyringe';
import { LoginController } from '@presentation/user/controllers/LoginController';
import { SignUpController } from '@presentation/user/controllers/SignUpController';

import { validateLoginRequest } from '../validators/loginValidator';
import { validateSignUpRequest } from '../validators/signUpValidator';

const router = Router();
const signUpController = container.resolve(SignUpController);
const loginController = container.resolve(LoginController);

router.post('/signup', validateSignUpRequest, signUpController.handle);
router.post('/login', validateLoginRequest, loginController.handle);

export default router;
