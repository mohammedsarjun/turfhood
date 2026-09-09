import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import { OwnerDashboardController } from '../controllers/OwnerDashboardController.js';

const router = Router({ mergeParams: true });
const controller = container.resolve(OwnerDashboardController);
router.get('/', authenticate, controller.get);
export default router;
