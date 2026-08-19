import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ICreateCourtUseCase } from '@application/court/use-cases/ICreateCourtUseCase';
import type { IListCourtsUseCase } from '@application/court/use-cases/IListCourtsUseCase';
import type { IManageCourtDetailsUseCase } from '@application/court/use-cases/IManageCourtDetailsUseCase';
import { COURT_TOKENS } from '@domain/court/tokens';
import { TokenMissingError } from '@domain/user/errors/TokenMissingError';
import type { AuthenticatedRequest } from '@presentation/shared/middlewares/authenticate';
import { HttpStatus } from '@shared/constants/httpStatus';

import type {
  ValidatedCourtListRequest,
  ValidatedCourtRequest,
  ValidatedAvailabilityOverrideRequest,
  ValidatedCourtUpdateRequest,
} from '../validators/courtValidators.js';

function userId(req: Request): string {
  const id = (req as AuthenticatedRequest).user?.userId;
  if (!id) throw new TokenMissingError();
  return id;
}

@injectable()
export class CourtController {
  constructor(
    @inject(COURT_TOKENS.CreateCourtUseCase) private readonly createCourt: ICreateCourtUseCase,
    @inject(COURT_TOKENS.ListCourtsUseCase) private readonly listCourts: IListCourtsUseCase,
    @inject(COURT_TOKENS.ManageCourtDetailsUseCase) private readonly manageDetails: IManageCourtDetailsUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = (req as ValidatedCourtRequest).validatedCourt!;
      const files = (req as Request & { files?: Express.Multer.File[] }).files ?? [];
      const court = await this.createCourt.execute({
        ...data,
        ownerId: userId(req),
        portalTurfId: req.params.turfId as string,
        images: files.map((file) => ({
          buffer: file.buffer,
          filename: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
        })),
      });
      res.status(HttpStatus.CREATED).json({ court });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req as ValidatedCourtListRequest).validatedQuery!;
      const result = await this.listCourts.execute({
        portalTurfId: req.params.turfId as string,
        ownerId: userId(req),
        page: query.page,
        limit: query.limit,
        ...(query.search ? { search: query.search } : {}),
      });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  details = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.manageDetails.get({ portalTurfId: req.params.turfId as string, courtId: req.params.courtId as string, ownerId: userId(req) });
      res.status(HttpStatus.OK).json(result);
    } catch (error) { next(error); }
  };

  createOverride = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = (req as ValidatedAvailabilityOverrideRequest).validatedOverride!;
      const availabilityOverride = await this.manageDetails.createOverride({ ...data, portalTurfId: req.params.turfId as string, courtId: req.params.courtId as string, ownerId: userId(req) });
      res.status(HttpStatus.CREATED).json({ availabilityOverride });
    } catch (error) { next(error); }
  };

  updateOverride = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = (req as ValidatedAvailabilityOverrideRequest).validatedOverride!;
      const availabilityOverride = await this.manageDetails.updateOverride({ ...data, portalTurfId: req.params.turfId as string, courtId: req.params.courtId as string, overrideId: req.params.overrideId as string, ownerId: userId(req) });
      res.status(HttpStatus.OK).json({ availabilityOverride });
    } catch (error) { next(error); }
  };

  deleteOverride = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.manageDetails.deleteOverride({ portalTurfId: req.params.turfId as string, courtId: req.params.courtId as string, overrideId: req.params.overrideId as string, ownerId: userId(req) });
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) { next(error); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = (req as ValidatedCourtUpdateRequest).validatedCourtUpdate!;
      const court = await this.manageDetails.update({ ...data, portalTurfId: req.params.turfId as string, courtId: req.params.courtId as string, ownerId: userId(req) });
      res.status(HttpStatus.OK).json({ court });
    } catch (error) { next(error); }
  };
}
