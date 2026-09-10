import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticate } from '@presentation/shared/middlewares/authenticate';
import { PayoutController } from '../controllers/PayoutController.js';
import { validateBankAccount, validateWithdrawal } from '../validators/payoutValidators.js';

const router = Router({ mergeParams: true });
const controller = container.resolve(PayoutController);

router.get('/', authenticate, controller.ownerOverview);
router.post('/bank-accounts', authenticate, validateBankAccount, controller.addBankAccount);
router.post('/withdrawals', authenticate, validateWithdrawal, controller.requestWithdrawal);

export default router;
