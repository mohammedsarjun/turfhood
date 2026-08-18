import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';

import { CourtController } from '../controllers/CourtController.js';
import { uploadCourtImages } from '../middlewares/uploadCourtImages.js';
import { validateCreateCourt, validateListCourts } from '../validators/courtValidators.js';

const router = Router({ mergeParams: true });
const controller = container.resolve(CourtController);

router.get('/', authenticate, validateListCourts, controller.list);
router.post('/', authenticate, uploadCourtImages, validateCreateCourt, controller.create);

export default router;
