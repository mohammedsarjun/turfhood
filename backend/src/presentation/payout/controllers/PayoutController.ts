import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IManagePayoutsUseCase } from '@application/payout/use-cases/IManagePayoutsUseCase';
import { PAYOUT_TOKENS } from '@domain/payout/tokens';
import { HttpStatus } from '@shared/constants/httpStatus';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import { parsePagination } from '@presentation/shared/utils/pagination';
import type {
  ValidatedBankAccountRequest,
  ValidatedWithdrawalRejectionRequest,
  ValidatedWithdrawalRequest,
} from '../validators/payoutValidators.js';

@injectable()
export class PayoutController {
  constructor(@inject(PAYOUT_TOKENS.UseCase) private readonly payouts: IManagePayoutsUseCase) {}

  ownerOverview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = (req as AuthenticatedRequest).user!.userId;
      res.json(await this.payouts.getOwnerOverview(ownerId, String(req.params.turfId)));
    } catch (error) {
      next(error);
    }
  };

  addBankAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = (req as AuthenticatedRequest).user!.userId;
      const input = (req as ValidatedBankAccountRequest).validatedBankAccount!;
      res.status(HttpStatus.CREATED).json(await this.payouts.addBankAccount(ownerId, input));
    } catch (error) {
      next(error);
    }
  };

  requestWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ownerId = (req as AuthenticatedRequest).user!.userId;
      const input = (req as ValidatedWithdrawalRequest).validatedWithdrawal!;
      res
        .status(HttpStatus.CREATED)
        .json(await this.payouts.requestWithdrawal(ownerId, String(req.params.turfId), input));
    } catch (error) {
      next(error);
    }
  };

  adminList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pagination = parsePagination(req.query, 20, 50);
      const status =
        req.query.status === 'pending' || req.query.status === 'paid' || req.query.status === 'rejected'
          ? req.query.status
          : undefined;
      res.json(
        await this.payouts.listAdminRequests({
          ...pagination,
          ...(status ? { status } : {}),
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  markPaid = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.payouts.markPaid(String(req.params.id)));
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = (req as ValidatedWithdrawalRejectionRequest).validatedRejection!;
      res.json(await this.payouts.reject(String(req.params.id), input.reason));
    } catch (error) {
      next(error);
    }
  };
}
