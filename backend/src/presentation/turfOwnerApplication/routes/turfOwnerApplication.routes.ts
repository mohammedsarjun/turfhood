import { Router } from 'express';
import { container } from 'tsyringe';
import { adminOnly } from '@presentation/admin/middlewares/adminOnly';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import { TurfOwnerApplicationController } from '@presentation/turfOwnerApplication/controllers/TurfOwnerApplicationController';

import { uploadTurfApplicationDocuments } from '../middlewares/uploadTurfApplicationDocuments.js';
import { validateListTurfOwnerApplicationsRequest } from '../validators/listTurfOwnerApplicationsValidator.js';
import { validateRejectTurfOwnerApplicationRequest } from '../validators/rejectTurfOwnerApplicationValidator.js';
import { validateSubmitTurfOwnerApplicationRequest } from '../validators/submitTurfOwnerApplicationValidator.js';

const router = Router();
const turfOwnerApplicationController = container.resolve(TurfOwnerApplicationController);

router.post(
  '/',
  authenticate,
  uploadTurfApplicationDocuments,
  validateSubmitTurfOwnerApplicationRequest,
  turfOwnerApplicationController.submit,
);
router.get('/me', authenticate, turfOwnerApplicationController.getMine);
router.get('/mine', authenticate, turfOwnerApplicationController.listMine);

router.get(
  '/',
  adminOnly,
  validateListTurfOwnerApplicationsRequest,
  turfOwnerApplicationController.list,
);
router.patch('/:id/approve', adminOnly, turfOwnerApplicationController.approve);
router.patch(
  '/:id/reject',
  adminOnly,
  validateRejectTurfOwnerApplicationRequest,
  turfOwnerApplicationController.reject,
);

export default router;
