import { Router } from 'express';
import multer from 'multer';
import { container } from 'tsyringe';
import { adminOnly } from '@presentation/admin/middlewares/adminOnly';

import { BannerController } from '../controllers/BannerController.js';

const router = Router();
const controller = container.resolve(BannerController);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

router.get('/', controller.list);
router.post('/', adminOnly, upload, controller.create);
router.delete('/:id', adminOnly, controller.delete);
export default router;
