import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import { FavoriteController } from '../controllers/FavoriteController.js';

const router = Router();
const controller = container.resolve(FavoriteController);
router.use(authenticate);
router.get('/', controller.list);
router.get('/ids', controller.ids);
router.put('/:turfId', controller.add);
router.delete('/:turfId', controller.remove);
export default router;
