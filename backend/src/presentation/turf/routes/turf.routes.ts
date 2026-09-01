import { Router } from 'express';
import { container } from 'tsyringe';

import { TurfDiscoveryController } from '../controllers/TurfDiscoveryController.js';

const router = Router();
const controller = container.resolve(TurfDiscoveryController);
router.get('/nearby', controller.nearby);
router.get('/discover', controller.discover);
router.get('/:id', controller.details);
export default router;
