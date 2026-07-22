import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ICreateSportsTypeUseCase } from '@application/sportsType/use-cases/ICreateSportsTypeUseCase';
import type { IListSportsTypesUseCase } from '@application/sportsType/use-cases/IListSportsTypesUseCase';
import type { IToggleSportsTypeListedUseCase } from '@application/sportsType/use-cases/IToggleSportsTypeListedUseCase';
import type { IUpdateSportsTypeUseCase } from '@application/sportsType/use-cases/IUpdateSportsTypeUseCase';
import type { IUploadSportsTypeIconUseCase } from '@application/sportsType/use-cases/IUploadSportsTypeIconUseCase';
import { InvalidSportsTypeIconFileError } from '@domain/sportsType/errors/InvalidSportsTypeIconFileError';
import { SPORTS_TYPE_TOKENS } from '@domain/sportsType/tokens';
import { HttpStatus } from '@shared/constants/httpStatus';

import type { ListSportsTypesRequest } from '../validators/listSportsTypesValidator.js';

@injectable()
export class SportsTypeController {
  constructor(
    @inject(SPORTS_TYPE_TOKENS.ListSportsTypesUseCase)
    private readonly listSportsTypesUseCase: IListSportsTypesUseCase,
    @inject(SPORTS_TYPE_TOKENS.CreateSportsTypeUseCase)
    private readonly createSportsTypeUseCase: ICreateSportsTypeUseCase,
    @inject(SPORTS_TYPE_TOKENS.UpdateSportsTypeUseCase)
    private readonly updateSportsTypeUseCase: IUpdateSportsTypeUseCase,
    @inject(SPORTS_TYPE_TOKENS.ToggleSportsTypeListedUseCase)
    private readonly toggleSportsTypeListedUseCase: IToggleSportsTypeListedUseCase,
    @inject(SPORTS_TYPE_TOKENS.UploadSportsTypeIconUseCase)
    private readonly uploadSportsTypeIconUseCase: IUploadSportsTypeIconUseCase,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, search, isListed } = (req as ListSportsTypesRequest).validatedQuery!;
      const result = await this.listSportsTypesUseCase.execute({
        page,
        limit,
        ...(search ? { search } : {}),
        ...(isListed !== undefined ? { isListed } : {}),
      });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  /** Public, read-only catalog listing (listed items only) — consumed by e.g. the turf-owner onboarding form's sport picker. */
  listPublic = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listSportsTypesUseCase.execute({
        page: 1,
        limit: 100,
        isListed: true,
      });
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) {
        throw new InvalidSportsTypeIconFileError('An icon image is required.');
      }
      const item = await this.createSportsTypeUseCase.execute({
        name: req.body.name,
        iconBuffer: file.buffer,
        iconFilename: file.originalname,
        iconMimeType: file.mimetype,
        iconSizeBytes: file.size,
      });
      res.status(HttpStatus.CREATED).json({ item });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.updateSportsTypeUseCase.execute({
        id: req.params.id as string,
        ...req.body,
      });
      res.status(HttpStatus.OK).json({ item });
    } catch (error) {
      next(error);
    }
  };

  toggleListed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.toggleSportsTypeListedUseCase.execute({
        id: req.params.id as string,
        isListed: req.body.isListed,
      });
      res.status(HttpStatus.OK).json({ item });
    } catch (error) {
      next(error);
    }
  };

  uploadIcon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) {
        throw new InvalidSportsTypeIconFileError('No image file was provided.');
      }
      const item = await this.uploadSportsTypeIconUseCase.execute({
        id: req.params.id as string,
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      });
      res.status(HttpStatus.OK).json({ item });
    } catch (error) {
      next(error);
    }
  };
}
