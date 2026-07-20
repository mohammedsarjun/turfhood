import { Router } from 'express';
import { container } from 'tsyringe';
import { adminOnly } from '@presentation/admin/middlewares/adminOnly';
import { AmenityController } from '@presentation/amenity/controllers/AmenityController';

import { uploadAmenityIcon } from '../middlewares/uploadAmenityIcon.js';
import { validateCreateAmenityRequest } from '../validators/createAmenityValidator.js';
import { validateListAmenitiesRequest } from '../validators/listAmenitiesValidator.js';
import { validateToggleAmenityListedRequest } from '../validators/toggleAmenityListedValidator.js';
import { validateUpdateAmenityRequest } from '../validators/updateAmenityValidator.js';

const router = Router();
const amenityController = container.resolve(AmenityController);

router.get('/', adminOnly, validateListAmenitiesRequest, amenityController.list);
router.post(
  '/',
  adminOnly,
  uploadAmenityIcon,
  validateCreateAmenityRequest,
  amenityController.create,
);
router.patch('/:id', adminOnly, validateUpdateAmenityRequest, amenityController.update);
router.patch(
  '/:id/listed',
  adminOnly,
  validateToggleAmenityListedRequest,
  amenityController.toggleListed,
);
router.post('/:id/icon', adminOnly, uploadAmenityIcon, amenityController.uploadIcon);

export default router;
