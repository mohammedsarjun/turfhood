import { Router } from 'express';
import { container } from 'tsyringe';
import { adminOnly } from '@presentation/admin/middlewares/adminOnly';
import { SportsTypeController } from '@presentation/sportsType/controllers/SportsTypeController';

import { uploadSportsTypeIcon } from '../middlewares/uploadSportsTypeIcon.js';
import { validateCreateSportsTypeRequest } from '../validators/createSportsTypeValidator.js';
import { validateListSportsTypesRequest } from '../validators/listSportsTypesValidator.js';
import { validateToggleSportsTypeListedRequest } from '../validators/toggleSportsTypeListedValidator.js';
import { validateUpdateSportsTypeRequest } from '../validators/updateSportsTypeValidator.js';

const router = Router();
const sportsTypeController = container.resolve(SportsTypeController);

router.get('/', adminOnly, validateListSportsTypesRequest, sportsTypeController.list);
router.post(
  '/',
  adminOnly,
  uploadSportsTypeIcon,
  validateCreateSportsTypeRequest,
  sportsTypeController.create,
);
router.patch('/:id', adminOnly, validateUpdateSportsTypeRequest, sportsTypeController.update);
router.patch(
  '/:id/listed',
  adminOnly,
  validateToggleSportsTypeListedRequest,
  sportsTypeController.toggleListed,
);
router.post('/:id/icon', adminOnly, uploadSportsTypeIcon, sportsTypeController.uploadIcon);

export default router;
