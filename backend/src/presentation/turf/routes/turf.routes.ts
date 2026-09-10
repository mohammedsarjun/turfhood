import { Router } from 'express';
import { container } from 'tsyringe';

import { TurfDiscoveryController } from '../controllers/TurfDiscoveryController.js';
import { OwnerTurfController } from '../controllers/OwnerTurfController.js';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import { uploadTurfCover } from '../middlewares/uploadTurfCover.js';
import { uploadTurfGallery } from '../middlewares/uploadTurfGallery.js';
import { validateOwnerTurfUpdate } from '../validators/ownerTurfValidators.js';

const router = Router();
const controller = container.resolve(TurfDiscoveryController);
const ownerController = container.resolve(OwnerTurfController);
router.get('/nearby', controller.nearby);
router.get('/discover', controller.discover);
router.get('/:id/manage', authenticate, ownerController.details);
router.put('/:id/manage', authenticate, validateOwnerTurfUpdate, ownerController.update);
router.post('/:id/manage/cover', authenticate, uploadTurfCover, ownerController.cover);
router.put('/:id/manage/images', authenticate, uploadTurfGallery, ownerController.gallery);
router.get('/:id/courts/:courtId/availability', controller.courtDetails);
router.get('/:id', controller.details);
export default router;
