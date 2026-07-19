import type { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { clearAuthCookie } from '@presentation/shared/utils/authCookie';

/** No use case needed — clearing the auth cookie has no domain logic to orchestrate. */
@injectable()
export class LogoutController {
  handle = (_req: Request, res: Response): void => {
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logged out successfully.' });
  };
}
