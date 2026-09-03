import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import { ReviewController } from '../controllers/ReviewController.js';

const router = Router();
const controller = container.resolve(ReviewController);
router.get('/turfs/:turfId/reviews', controller.publicList);
router.get('/bookings/:bookingId/review', authenticate, controller.mine);
router.post('/bookings/:bookingId/review', authenticate, controller.create);
router.get('/turf-portal/:turfId/reviews', authenticate, controller.ownerList);
export default router;
