import type { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import type { ICreateAmenityUseCase } from '@application/amenity/use-cases/ICreateAmenityUseCase';
import type { IListAmenitiesUseCase } from '@application/amenity/use-cases/IListAmenitiesUseCase';
import type { IToggleAmenityListedUseCase } from '@application/amenity/use-cases/IToggleAmenityListedUseCase';
import type { IUpdateAmenityUseCase } from '@application/amenity/use-cases/IUpdateAmenityUseCase';
import type { IUploadAmenityIconUseCase } from '@application/amenity/use-cases/IUploadAmenityIconUseCase';
import { InvalidAmenityIconFileError } from '@domain/amenity/errors/InvalidAmenityIconFileError';
import { AMENITY_TOKENS } from '@domain/amenity/tokens';

import type { ListAmenitiesRequest } from '../validators/listAmenitiesValidator.js';

@injectable()
export class AmenityController {
  constructor(
    @inject(AMENITY_TOKENS.ListAmenitiesUseCase)
    private readonly listAmenitiesUseCase: IListAmenitiesUseCase,
    @inject(AMENITY_TOKENS.CreateAmenityUseCase)
    private readonly createAmenityUseCase: ICreateAmenityUseCase,
    @inject(AMENITY_TOKENS.UpdateAmenityUseCase)
    private readonly updateAmenityUseCase: IUpdateAmenityUseCase,
    @inject(AMENITY_TOKENS.ToggleAmenityListedUseCase)
    private readonly toggleAmenityListedUseCase: IToggleAmenityListedUseCase,
    @inject(AMENITY_TOKENS.UploadAmenityIconUseCase)
    private readonly uploadAmenityIconUseCase: IUploadAmenityIconUseCase,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, search, isListed } = (req as ListAmenitiesRequest).validatedQuery!;
      const result = await this.listAmenitiesUseCase.execute({
        page,
        limit,
        ...(search ? { search } : {}),
        ...(isListed !== undefined ? { isListed } : {}),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /** Public, read-only catalog listing (listed items only) — consumed by e.g. the turf-owner onboarding form's amenity picker. */
  listPublic = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listAmenitiesUseCase.execute({ page: 1, limit: 100, isListed: true });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) {
        throw new InvalidAmenityIconFileError('An icon image is required.');
      }
      const item = await this.createAmenityUseCase.execute({
        name: req.body.name,
        iconBuffer: file.buffer,
        iconFilename: file.originalname,
        iconMimeType: file.mimetype,
        iconSizeBytes: file.size,
      });
      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.updateAmenityUseCase.execute({
        id: req.params.id as string,
        ...req.body,
      });
      res.status(200).json({ item });
    } catch (error) {
      next(error);
    }
  };

  toggleListed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.toggleAmenityListedUseCase.execute({
        id: req.params.id as string,
        isListed: req.body.isListed,
      });
      res.status(200).json({ item });
    } catch (error) {
      next(error);
    }
  };

  uploadIcon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) {
        throw new InvalidAmenityIconFileError('No image file was provided.');
      }
      const item = await this.uploadAmenityIconUseCase.execute({
        id: req.params.id as string,
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      });
      res.status(200).json({ item });
    } catch (error) {
      next(error);
    }
  };
}
