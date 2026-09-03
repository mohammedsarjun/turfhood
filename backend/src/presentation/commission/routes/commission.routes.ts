import { Router } from 'express';
import { container } from 'tsyringe';
import { adminOnly } from '@presentation/admin/middlewares/adminOnly';

import { CommissionSettingController } from '../controllers/CommissionSettingController.js';

const router = Router();
const controller = container.resolve(CommissionSettingController);

router.use(adminOnly);
router.get('/', controller.get);
router.put('/', controller.update);

export default router;
