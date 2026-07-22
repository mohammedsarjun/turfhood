import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IChangePasswordUseCase } from '@application/user/use-cases/IChangePasswordUseCase';
import type { IConfirmEmailChangeUseCase } from '@application/user/use-cases/IConfirmEmailChangeUseCase';
import type { IRequestEmailChangeUseCase } from '@application/user/use-cases/IRequestEmailChangeUseCase';
import type { ISetPasswordUseCase } from '@application/user/use-cases/ISetPasswordUseCase';
import type { IUpdateAvatarUseCase } from '@application/user/use-cases/IUpdateAvatarUseCase';
import type { IUpdateNameUseCase } from '@application/user/use-cases/IUpdateNameUseCase';
import type { IUpdatePhoneUseCase } from '@application/user/use-cases/IUpdatePhoneUseCase';
import { InvalidAvatarFileError } from '@domain/user/errors/InvalidAvatarFileError';
import { TokenMissingError } from '@domain/user/errors/TokenMissingError';
import { USER_TOKENS } from '@domain/user/tokens';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import {
  clearEmailChangeOtpSessionCookie,
  setEmailChangeOtpSessionCookie,
} from '@presentation/shared/utils/emailChangeOtpSessionCookie';
import { env } from '@config/env';
import { HttpStatus } from '@shared/constants/httpStatus';

import type { EmailChangeOtpSessionRequest } from '../middlewares/requireEmailChangeOtpSession.js';

function requireUserId(req: Request): string {
  const userId = (req as AuthenticatedRequest).user?.userId;
  if (!userId) {
    throw new TokenMissingError();
  }
  return userId;
}

@injectable()
export class ProfileController {
  constructor(
    @inject(USER_TOKENS.UpdateNameUseCase) private readonly updateNameUseCase: IUpdateNameUseCase,
    @inject(USER_TOKENS.UpdatePhoneUseCase)
    private readonly updatePhoneUseCase: IUpdatePhoneUseCase,
    @inject(USER_TOKENS.RequestEmailChangeUseCase)
    private readonly requestEmailChangeUseCase: IRequestEmailChangeUseCase,
    @inject(USER_TOKENS.ConfirmEmailChangeUseCase)
    private readonly confirmEmailChangeUseCase: IConfirmEmailChangeUseCase,
    @inject(USER_TOKENS.ChangePasswordUseCase)
    private readonly changePasswordUseCase: IChangePasswordUseCase,
    @inject(USER_TOKENS.SetPasswordUseCase)
    private readonly setPasswordUseCase: ISetPasswordUseCase,
    @inject(USER_TOKENS.UpdateAvatarUseCase)
    private readonly updateAvatarUseCase: IUpdateAvatarUseCase,
  ) {}

  updateName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const user = await this.updateNameUseCase.execute({ userId, name: req.body.name });
      res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      next(error);
    }
  };

  updatePhone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const user = await this.updatePhoneUseCase.execute({ userId, phone: req.body.phone });
      res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      next(error);
    }
  };

  requestEmailChange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const result = await this.requestEmailChangeUseCase.execute({
        userId,
        newEmail: req.body.newEmail,
      });
      setEmailChangeOtpSessionCookie(res, result.otpSessionToken, env.OTP_SESSION_EXPIRY_SECONDS);
      res
        .status(HttpStatus.OK)
        .json({ message: result.message, expiresInSeconds: result.expiresInSeconds });
    } catch (error) {
      next(error);
    }
  };

  confirmEmailChange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const { emailChangeOtpSession } = req as EmailChangeOtpSessionRequest;
      const result = await this.confirmEmailChangeUseCase.execute({
        userId,
        newEmail: emailChangeOtpSession!.email,
        otp: req.body.otp,
      });
      clearEmailChangeOtpSessionCookie(res);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const result = await this.changePasswordUseCase.execute({
        userId,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  setPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const result = await this.setPasswordUseCase.execute({
        userId,
        newPassword: req.body.newPassword,
      });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) {
        throw new InvalidAvatarFileError('No image file was provided.');
      }
      const user = await this.updateAvatarUseCase.execute({
        userId,
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      });
      res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      next(error);
    }
  };
}
