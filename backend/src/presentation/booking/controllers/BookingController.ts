import { parsePagination } from '@presentation/shared/utils/pagination';
import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { CreateReservationRequest } from '@turfhood/shared';
import type { IManageBookingsUseCase } from '@application/booking/use-cases/IManageBookingsUseCase';
import { BOOKING_TOKENS } from '@domain/booking/tokens';
import type { PaymentCallback } from '@domain/booking/services/IPaymentService';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import { HttpStatus } from '@shared/constants/httpStatus';
import { env } from '@config/env';

const userId = (req: Request) => (req as AuthenticatedRequest).user!.userId;
@injectable()
export class BookingController {
  constructor(@inject(BOOKING_TOKENS.UseCase) private readonly bookings: IManageBookingsUseCase) {}
  reserve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.bookings.reserve(userId(req), req.body as CreateReservationRequest));
    } catch (error) {
      next(error);
    }
  };
  mine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = parsePagination(req.query, 10, 20);
      const filter = req.query.filter;
      res.json(
        await this.bookings.listMine(
          userId(req),
          page,
          limit,
          filter === 'upcoming' || filter === 'completed' || filter === 'cancelled'
            ? filter
            : undefined,
        ),
      );
    } catch (error) {
      next(error);
    }
  };
  details = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.bookings.getMine(userId(req), String(req.params.id)));
    } catch (error) {
      next(error);
    }
  };
  retry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res
        .status(HttpStatus.CREATED)
        .json(await this.bookings.retryPayment(userId(req), String(req.params.id)));
    } catch (error) {
      next(error);
    }
  };
  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await this.bookings.cancelMine(
          userId(req),
          String(req.params.id),
          typeof req.body.reason === 'string' ? req.body.reason : undefined,
        ),
      );
    } catch (error) {
      next(error);
    }
  };
  payuSuccess = async (req: Request, res: Response) => {
    try {
      const booking = await this.bookings.paymentCallback(req.body as PaymentCallback);
      res.redirect(`${env.FRONTEND_URL}/bookings/${booking.id}?payment=success`);
    } catch {
      res.redirect(`${env.FRONTEND_URL}/bookings?payment=failed`);
    }
  };
  payuFailure = async (req: Request, res: Response) => {
    try {
      await this.bookings.paymentCallback(req.body as PaymentCallback);
    } catch {
      /* failure is reflected by the use case */
    }
    const bookingId = typeof req.body.udf1 === 'string' ? req.body.udf1 : '';
    res.redirect(
      bookingId
        ? `${env.FRONTEND_URL}/bookings/${bookingId}?payment=failed`
        : `${env.FRONTEND_URL}/bookings?payment=failed`,
    );
  };
  webhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.bookings.paymentCallback(req.body as PaymentCallback);
      res.status(HttpStatus.OK).json({ received: true });
    } catch (error) {
      next(error);
    }
  };
  ownerList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page } = parsePagination(req.query);
      res.json(await this.bookings.listForOwner(userId(req), String(req.params.turfId), page, 20));
    } catch (error) {
      next(error);
    }
  };
  ownerCancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(
        await this.bookings.cancelForOwner(
          userId(req),
          String(req.params.turfId),
          String(req.params.id),
          typeof req.body.reason === 'string' ? req.body.reason : undefined,
        ),
      );
    } catch (error) {
      next(error);
    }
  };
  abandon = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.bookings.abandonCheckout(userId(req), String(req.params.id));
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };
  adminEscalatedRefunds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = parsePagination(req.query, 20, 50);
      res.json(await this.bookings.listEscalatedRefunds(page, limit));
    } catch (error) {
      next(error);
    }
  };
  adminVerifyRefund = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = typeof req.body.payuRequestId === 'string' ? req.body.payuRequestId : '';
      res.json(await this.bookings.verifyManualRefund(String(req.params.id), requestId));
    } catch (error) {
      next(error);
    }
  };
}
