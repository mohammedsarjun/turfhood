import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import { OpenSessionController } from '../controllers/OpenSessionController.js';
const router = Router({ mergeParams: true }); const controller = container.resolve(OpenSessionController);
router.get('/', authenticate, controller.ownerList); export default router;
