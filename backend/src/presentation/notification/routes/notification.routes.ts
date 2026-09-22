import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import { NotificationController } from '../controllers/NotificationController.js';

const router = Router();
const controller = container.resolve(NotificationController);

router.use(authenticate);
router.get('/', controller.list);
router.patch('/:id/read', controller.markRead);

export default router;
