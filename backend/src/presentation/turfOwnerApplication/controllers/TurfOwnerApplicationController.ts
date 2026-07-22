import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { IApproveTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/IApproveTurfOwnerApplicationUseCase';
import type { IGetMyTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/IGetMyTurfOwnerApplicationUseCase';
import type { IListMyTurfOwnerApplicationsUseCase } from '@application/turfOwnerApplication/use-cases/IListMyTurfOwnerApplicationsUseCase';
import type { IListTurfOwnerApplicationsUseCase } from '@application/turfOwnerApplication/use-cases/IListTurfOwnerApplicationsUseCase';
import type { IRejectTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/IRejectTurfOwnerApplicationUseCase';
import type { ISubmitTurfOwnerApplicationUseCase } from '@application/turfOwnerApplication/use-cases/ISubmitTurfOwnerApplicationUseCase';
import { InvalidDocumentFileError } from '@domain/turfOwnerApplication/errors/InvalidDocumentFileError';
import { InvalidTurfImageError } from '@domain/turfOwnerApplication/errors/InvalidTurfImageError';
import { TURF_OWNER_APPLICATION_TOKENS } from '@domain/turfOwnerApplication/tokens';
import { TokenMissingError } from '@domain/user/errors/TokenMissingError';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import type { AdminAuthenticatedRequest } from '@presentation/admin/middlewares/adminOnly';

import type { ListTurfOwnerApplicationsRequest } from '../validators/listTurfOwnerApplicationsValidator.js';
import type { SubmitTurfOwnerApplicationRequest } from '../validators/submitTurfOwnerApplicationValidator.js';

function requireUserId(req: Request): string {
  const userId = (req as AuthenticatedRequest).user?.userId;
  if (!userId) {
    throw new TokenMissingError();
  }
  return userId;
}

function requireAdminId(req: Request): string {
  const adminId = (req as AdminAuthenticatedRequest).admin?.userId;
  if (!adminId) {
    throw new TokenMissingError();
  }
  return adminId;
}

@injectable()
export class TurfOwnerApplicationController {
  constructor(
    @inject(TURF_OWNER_APPLICATION_TOKENS.SubmitTurfOwnerApplicationUseCase)
    private readonly submitUseCase: ISubmitTurfOwnerApplicationUseCase,
    @inject(TURF_OWNER_APPLICATION_TOKENS.GetMyTurfOwnerApplicationUseCase)
    private readonly getMineUseCase: IGetMyTurfOwnerApplicationUseCase,
    @inject(TURF_OWNER_APPLICATION_TOKENS.ListMyTurfOwnerApplicationsUseCase)
    private readonly listMineUseCase: IListMyTurfOwnerApplicationsUseCase,
    @inject(TURF_OWNER_APPLICATION_TOKENS.ListTurfOwnerApplicationsUseCase)
    private readonly listUseCase: IListTurfOwnerApplicationsUseCase,
    @inject(TURF_OWNER_APPLICATION_TOKENS.ApproveTurfOwnerApplicationUseCase)
    private readonly approveUseCase: IApproveTurfOwnerApplicationUseCase,
    @inject(TURF_OWNER_APPLICATION_TOKENS.RejectTurfOwnerApplicationUseCase)
    private readonly rejectUseCase: IRejectTurfOwnerApplicationUseCase,
  ) {}

  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const submission = (req as SubmitTurfOwnerApplicationRequest).validatedSubmission!;
      const fileGroups =
        (req as Request & { files?: Record<string, Express.Multer.File[]> }).files ?? {};
      const documentFiles = fileGroups.documents ?? [];
      const imageFiles = fileGroups.images ?? [];

      if (documentFiles.length === 0) {
        throw new InvalidDocumentFileError('At least one verification document is required.');
      }
      if (documentFiles.length !== submission.documentTypes.length) {
        throw new InvalidDocumentFileError('Each document must have a matching document type.');
      }
      if (imageFiles.length === 0) {
        throw new InvalidTurfImageError('Upload between 1 and 10 turf photos.');
      }
      if (imageFiles.length !== submission.imageCoverFlags.length) {
        throw new InvalidTurfImageError('Each photo must have a matching cover-photo flag.');
      }

      const application = await this.submitUseCase.execute({
        applicantUserId: userId,
        name: submission.name,
        ...(submission.description ? { description: submission.description } : {}),
        address: submission.address,
        coordinates: submission.coordinates,
        sportsOffered: submission.sportsOffered,
        amenities: submission.amenities,
        documents: documentFiles.map((file, index) => ({
          type: submission.documentTypes[index] as string,
          buffer: file.buffer,
          filename: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
        })),
        images: imageFiles.map((file, index) => ({
          buffer: file.buffer,
          filename: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          isCover: submission.imageCoverFlags[index] as boolean,
        })),
      });
      res.status(201).json({ application });
    } catch (error) {
      next(error);
    }
  };

  getMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const application = await this.getMineUseCase.execute(userId);
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const applications = await this.listMineUseCase.execute(userId);
      res.status(200).json({ applications });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, status } = (req as ListTurfOwnerApplicationsRequest).validatedQuery!;
      const result = await this.listUseCase.execute({
        page,
        limit,
        ...(status ? { status } : {}),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = requireAdminId(req);
      const application = await this.approveUseCase.execute({
        applicationId: req.params.id as string,
        reviewedBy: adminId,
      });
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = requireAdminId(req);
      const application = await this.rejectUseCase.execute({
        applicationId: req.params.id as string,
        reviewedBy: adminId,
        reason: req.body.reviewNotes,
      });
      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  };
}
