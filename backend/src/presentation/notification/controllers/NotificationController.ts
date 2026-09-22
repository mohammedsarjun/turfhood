import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { NotificationFilter } from '@turfhood/shared';
import { NOTIFICATION_TOKENS } from '@domain/notification/tokens';
import type { IManageNotificationsUseCase } from '@application/notification/use-cases/IManageNotificationsUseCase';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import { parsePagination } from '@presentation/shared/utils/pagination';

const userId = (req: Request) => (req as AuthenticatedRequest).user!.userId;

@injectable()
export class NotificationController {
  constructor(
    @inject(NOTIFICATION_TOKENS.UseCase)
    private readonly notifications: IManageNotificationsUseCase,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = parsePagination(req.query, 10, 20);
      const filter: NotificationFilter = req.query.filter === 'read' ? 'read' : 'all';
      res.json(await this.notifications.list(userId(req), page, limit, filter));
    } catch (error) {
      next(error);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        notification: await this.notifications.markRead(userId(req), String(req.params.id)),
      });
    } catch (error) {
      next(error);
    }
  };
}
