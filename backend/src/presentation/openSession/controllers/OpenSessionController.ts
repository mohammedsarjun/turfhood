import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { CreateOpenSessionRequest } from '@turfhood/shared';
import type { IManageOpenSessionsUseCase } from '@application/openSession/use-cases/IManageOpenSessionsUseCase';
import { OPEN_SESSION_TOKENS } from '@domain/openSession/tokens';
import type { PaymentCallback } from '@domain/booking/services/IPaymentService';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import { HttpStatus } from '@shared/constants/httpStatus';
import { env } from '@config/env';

const userId = (request: Request) => (request as AuthenticatedRequest).user!.userId;

@injectable()
export class OpenSessionController {
  constructor(
    @inject(OPEN_SESSION_TOKENS.UseCase) private readonly sessions: IManageOpenSessionsUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.sessions.create(userId(req), req.body as CreateOpenSessionRequest));
    } catch (error) {
      next(error);
    }
  };
  join = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.sessions.join(userId(req), String(req.params.id)));
    } catch (error) {
      next(error);
    }
  };
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 9));
      const latitude = req.query.latitude === undefined ? undefined : Number(req.query.latitude);
      const longitude = req.query.longitude === undefined ? undefined : Number(req.query.longitude);
      const location =
        latitude !== undefined &&
        longitude !== undefined &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude)
          ? { latitude, longitude }
          : {};
      res.json(
        await this.sessions.list({
          page,
          limit,
          ...(typeof req.query.sportTypeId === 'string'
            ? { sportTypeId: req.query.sportTypeId }
            : {}),
          ...location,
        }),
      );
    } catch (error) {
      next(error);
    }
  };
  listMine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 10));
      res.json(await this.sessions.listMine(userId(req), page, limit));
    } catch (error) {
      next(error);
    }
  };
  details = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.sessions.details(String(req.params.id)));
    } catch (error) {
      next(error);
    }
  };
  payuSuccess = async (req: Request, res: Response) => {
    try {
      const session = await this.sessions.paymentCallback(req.body as PaymentCallback);
      res.redirect(`${env.FRONTEND_URL}/open-sessions/${session.id}?payment=success`);
    } catch {
      res.redirect(`${env.FRONTEND_URL}/open-sessions?payment=failed`);
    }
  };
  payuFailure = async (req: Request, res: Response) => {
    try {
      await this.sessions.paymentCallback(req.body as PaymentCallback);
    } catch {
      /* recorded by use case */
    }
    const id = typeof req.body.udf1 === 'string' ? req.body.udf1 : '';
    res.redirect(
      id
        ? `${env.FRONTEND_URL}/open-sessions/${id}?payment=failed`
        : `${env.FRONTEND_URL}/open-sessions?payment=failed`,
    );
  };
  webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.sessions.paymentCallback(req.body as PaymentCallback);
      res.status(HttpStatus.OK).json({ received: true });
    } catch (error) {
      next(error);
    }
  };
}
