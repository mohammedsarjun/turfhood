import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import { OwnerRevenueController } from '../controllers/OwnerRevenueController.js';
const router = Router({ mergeParams: true });
const controller = container.resolve(OwnerRevenueController);
router.get('/', authenticate, controller.get);
export default router;
