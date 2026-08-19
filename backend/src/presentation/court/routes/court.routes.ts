import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';

import { CourtController } from '../controllers/CourtController.js';
import { uploadCourtImages } from '../middlewares/uploadCourtImages.js';
import { validateAvailabilityOverride, validateCreateCourt, validateListCourts, validateUpdateCourt } from '../validators/courtValidators.js';

const router = Router({ mergeParams: true });
const controller = container.resolve(CourtController);

router.get('/', authenticate, validateListCourts, controller.list);
router.post('/', authenticate, uploadCourtImages, validateCreateCourt, controller.create);
router.get('/:courtId', authenticate, controller.details);
router.put('/:courtId', authenticate, validateUpdateCourt, controller.update);
router.post('/:courtId/availability-overrides', authenticate, validateAvailabilityOverride, controller.createOverride);
router.put('/:courtId/availability-overrides/:overrideId', authenticate, validateAvailabilityOverride, controller.updateOverride);
router.delete('/:courtId/availability-overrides/:overrideId', authenticate, controller.deleteOverride);

export default router;
